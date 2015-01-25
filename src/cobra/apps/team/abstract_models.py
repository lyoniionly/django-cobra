from __future__ import absolute_import, print_function

from hashlib import md5
import logging
from django.conf import settings

from django.core.urlresolvers import reverse
from django.db import models
from django.db.models import Q
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone

from cobra.core.compat import AUTH_USER_MODEL
from cobra.models import Model
from cobra.models import fields
from cobra.models import sane_repr
from cobra.models.utils import slugify_instance
from cobra.core.http import absolute_uri
from cobra.core.constants import MEMBER_TYPES, MEMBER_USER
from cobra.core.loading import get_class
from .utils import TeamStatus, TeamMemberType

TeamManager = get_class('team.managers', 'TeamManager')


@python_2_unicode_compatible
class AbstractTeam(Model):
    """
    A team represents a group of individuals which maintain ownership of projects.
    """
    organization = fields.FlexibleForeignKey('organization.Organization')
    slug = models.SlugField()
    name = models.CharField(max_length=64)
    owner = fields.FlexibleForeignKey(AUTH_USER_MODEL)
    status = fields.BoundedPositiveIntegerField(choices=(
        (TeamStatus.VISIBLE, _('Active')),
        (TeamStatus.PENDING_DELETION, _('Pending Deletion')),
        (TeamStatus.DELETION_IN_PROGRESS, _('Deletion in Progress')),
    ), default=TeamStatus.VISIBLE)
    date_added = models.DateTimeField(default=timezone.now, null=True)

    objects = TeamManager(cache_fields=(
        'pk',
        'slug',
    ))

    class Meta:
        abstract = True
        app_label = 'team'
        unique_together = (('organization', 'slug'),)

    __repr__ = sane_repr('slug', 'owner_id', 'name')

    def __str__(self):
        return '%s (%s)' % (self.name, self.slug)

    def save(self, *args, **kwargs):
        if not self.slug:
            slugify_instance(self, self.name, organization=self.organization)
        super(AbstractTeam, self).save(*args, **kwargs)

    def get_absolute_url(self):
        return absolute_uri(reverse('cobra-team-dashboard', args=[
            self.organization.slug,
            self.slug,
        ]))

    def get_owner_name(self):
        if not self.owner:
            return None
        if self.owner.first_name:
            return self.owner.first_name
        if self.owner.email:
            return self.owner.email.split('@', 1)[0]
        return self.owner.username

    @property
    def member_set(self):
        return self.organization.member_set.filter(
            Q(teams=self) | Q(has_global_access=True),
            user__is_active=True,
        )

    def has_access(self, user, access=None):
        queryset = self.member_set.filter(user=user)
        if access is not None:
            queryset = queryset.filter(type__lte=access)

        return queryset.exists()

    def get_audit_log_data(self):
        return {
            'slug': self.slug,
            'name': self.name,
            'status': self.status,
        }


@python_2_unicode_compatible
class AbstractTeamMember(Model):
    """
    Identifies relationships between teams and users.

    Users listed as team members are considered to have access to all projects
    and could be thought of as team owners (though their access level may not)
    be set to ownership.
    """
    team = fields.FlexibleForeignKey('team.Team', related_name=None)
    user = fields.FlexibleForeignKey(AUTH_USER_MODEL, related_name=None)
    type = fields.BoundedIntegerField(choices=(
        (TeamMemberType.MEMBER, _('Member')),
        (TeamMemberType.ADMIN, _('Admin')),
        (TeamMemberType.BOT, _('Bot')),
    ), default=TeamMemberType.MEMBER)
    date_added = models.DateTimeField(default=timezone.now)

    # objects = BaseManager()

    class Meta:
        abstract = True
        app_label = 'team'
        unique_together = (('team', 'user'),)

    __repr__ = sane_repr('team_id', 'user_id', 'type')


@python_2_unicode_compatible
class AbstractPendingTeamMember(Model):
    """
    Identifies relationships between teams and pending invites.
    """
    team = fields.FlexibleForeignKey('team.Team', related_name="pending_member_set")
    email = models.EmailField()
    type = fields.BoundedIntegerField(choices=MEMBER_TYPES, default=MEMBER_USER)
    date_added = models.DateTimeField(default=timezone.now)

    # objects = BaseManager()

    class Meta:
        abstract = True
        app_label = 'team'
        unique_together = (('team', 'email'),)

    __repr__ = sane_repr('team_id', 'email', 'type')

    @property
    def token(self):
        checksum = md5()
        for x in (str(self.team_id), self.email, settings.SECRET_KEY):
            checksum.update(x)
        return checksum.hexdigest()

    def send_invite_email(self):
        from cobra.core.email import MessageBuilder

        context = {
            'email': self.email,
            'team': self.team,
            'url': absolute_uri(reverse('cobra-accept-invite', kwargs={
                'member_id': self.id,
                'token': self.token,
            })),
        }

        msg = MessageBuilder(
            subject='Invite to join team: %s' % (self.team.name,),
            template='cobra/emails/member_invite.txt',
            context=context,
        )

        try:
            msg.send([self.email])
        except Exception as e:
            logger = logging.getLogger('cobra.mail.errors')
            logger.exception(e)
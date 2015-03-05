from __future__ import absolute_import, print_function

import logging

from hashlib import md5

from django.conf import settings
from django.core.urlresolvers import reverse
from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone
from easy_thumbnails.fields import ThumbnailerImageField

from cobra.core.compat import AUTH_USER_MODEL
from cobra.core.constants import RESERVED_ORGANIZATION_SLUGS
from cobra.core.http import absolute_uri
from cobra.core.loading import get_class
from cobra.core.utils import generate_sha1
from cobra.models import Model
from cobra.models import fields
from cobra.models import sane_repr
from cobra.models.utils import slugify_instance

from .utils import OrganizationStatus, OrganizationMemberType

OrganizationManager = get_class('organization.managers', 'OrganizationManager')


def upload_to_avatar(instance, filename):
    extension = filename.split('.')[-1].lower()
    salt, hash = generate_sha1(instance.id)
    path = settings.COBRA_ORGANIZATION_AVATAR_PATH % {'organization_slug': instance.slug,
                                                  'date': instance.date_added,
                                                  'date_now': timezone.now().date()}
    return '%(path)s%(hash)s.%(extension)s' % {'path': path,
                                               'hash': hash[:10],
                                               'extension': extension}

@python_2_unicode_compatible
class AbstractOrganization(Model):
    """
    A team represents a group of individuals which maintain ownership of projects.
    """
    AVATAR_SETTINGS = {'size': (settings.COBRA_ORGANIZATION_AVATAR_SIZE,
                                 settings.COBRA_ORGANIZATION_AVATAR_SIZE),
                       'crop': settings.COBRA_ORGANIZATION_AVATAR_CROP_TYPE}
    name = models.CharField(max_length=64)
    slug = models.SlugField(unique=True)
    owner = fields.FlexibleForeignKey(AUTH_USER_MODEL)
    status = fields.BoundedPositiveIntegerField(choices=(
        (OrganizationStatus.VISIBLE, _('Visible')),
        (OrganizationStatus.PENDING_DELETION, _('Pending Deletion')),
        (OrganizationStatus.DELETION_IN_PROGRESS, _('Deletion in Progress')),
    ), default=OrganizationStatus.VISIBLE)
    date_added = models.DateTimeField(default=timezone.now)
    members = models.ManyToManyField(AUTH_USER_MODEL, through='OrganizationMember', related_name='org_memberships')
    avatar = ThumbnailerImageField(_('Organization Avatar'),
                                    blank=True,
                                    upload_to=upload_to_avatar,
                                    resize_source=AVATAR_SETTINGS,
                                    help_text=_('The maximum file size allowed is 200KB.'))

    objects = OrganizationManager(cache_fields=(
        'pk',
        'slug',
    ))

    class Meta:
        abstract = True
        app_label = 'organization'
        db_table = 'cobra_organization'

    __repr__ = sane_repr('owner_id', 'name')

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            slugify_instance(self, self.name, reserved=RESERVED_ORGANIZATION_SLUGS)
        super(AbstractOrganization, self).save(*args, **kwargs)

    def has_access(self, user, access=None):
        queryset = self.member_set.filter(user=user)
        if access is not None:
            queryset = queryset.filter(type__lte=access)

        return queryset.exists()

    def get_avatar_url(self):
        """
        """
        # First check for a avatar and if any return that.
        if self.avatar:
            return self.avatar.url

        if settings.COBRA_ORGANIZATION_AVATAR_DEFAULT not in ['404', 'mm',
                                                            'identicon',
                                                            'monsterid',
                                                            'wavatar']:

            if settings.COBRA_ORGANIZATION_AVATAR_DEFAULT.startswith(settings.STATIC_URL):
                return settings.COBRA_ORGANIZATION_AVATAR_DEFAULT
            else:
                return settings.STATIC_URL + settings.COBRA_ORGANIZATION_AVATAR_DEFAULT
        else:
            return None

    def get_audit_log_data(self):
        return {
            'slug': self.slug,
            'name': self.name,
            'status': self.status,
        }



@python_2_unicode_compatible
class AbstractOrganizationMember(Model):
    """
    Identifies relationships between teams and users.

    Users listed as team members are considered to have access to all projects
    and could be thought of as team owners (though their access level may not)
    be set to ownership.
    """
    organization = fields.FlexibleForeignKey('organization.Organization', related_name="member_set")

    user = fields.FlexibleForeignKey(AUTH_USER_MODEL, null=True, blank=True,
                             related_name="cobra_orgmember_set")
    email = models.EmailField(null=True, blank=True)

    type = fields.BoundedPositiveIntegerField(choices=(
        (OrganizationMemberType.BOT, _('Bot')),
        (OrganizationMemberType.MEMBER, _('Member')),
        (OrganizationMemberType.ADMIN, _('Admin')),
        (OrganizationMemberType.OWNER, _('Owner')),
    ), default=OrganizationMemberType.MEMBER)
    date_added = models.DateTimeField(default=timezone.now)
    has_global_access = models.BooleanField(default=True)
    teams = models.ManyToManyField('team.Team', blank=True)

    class Meta:
        abstract = True
        app_label = 'organization'
        db_table = 'cobra_organizationmember'
        unique_together = (('organization', 'user'), ('organization', 'email'))

    __repr__ = sane_repr('organization_id', 'user_id', 'type')

    def __str__(self):
        return '%s - %s' % (self.organization.name, self.user.username)

    def save(self, *args, **kwargs):
        assert self.user_id or self.email, \
            'Must set user or email'
        return super(AbstractOrganizationMember, self).save(*args, **kwargs)

    @property
    def is_pending(self):
        return self.user_id is None

    @property
    def token(self):
        checksum = md5()
        for x in (str(self.organization_id), self.get_email(), settings.SECRET_KEY):
            checksum.update(x)
        return checksum.hexdigest()

    @property
    def scopes(self):
        scopes = []
        if self.type <= OrganizationMemberType.MEMBER:
            scopes.extend(['event:read', 'org:read', 'project:read', 'team:read'])
        if self.type <= OrganizationMemberType.ADMIN:
            scopes.extend(['event:write', 'project:write', 'team:write'])
        if self.type <= OrganizationMemberType.OWNER:
            scopes.extend(['event:delete', 'project:delete', 'team:delete'])
        if self.has_global_access:
            if self.type <= OrganizationMemberType.ADMIN:
                scopes.extend(['org:write'])
            if self.type <= OrganizationMemberType.OWNER:
                scopes.extend(['org:delete'])
        return scopes

    def send_invite_email(self):
        from cobra.core.email import MessageBuilder

        context = {
            'email': self.email,
            'organization': self.organization,
            'url': absolute_uri(reverse('organization:member-accept', kwargs={
                'member_id': self.id,
                'token': self.token,
            })),
        }

        msg = MessageBuilder(
            subject='Invite to join organization: %s' % (self.organization.name,),
            template='cobra/emails/member_invite.txt',
            context=context,
        )

        try:
            msg.send([self.get_email()])
        except Exception as e:
            logger = logging.getLogger('cobra.mail.errors')
            logger.exception(e)

    def get_display_name(self):
        if self.user_id:
            return self.user.get_display_name()
        return self.email

    def get_email(self):
        if self.user_id:
            return self.user.email
        return self.email

    def get_audit_log_data(self):
        return {
            'email': self.email,
            'user': self.user_id,
            'teams': [t.id for t in self.teams.all()],
            'has_global_access': self.has_global_access,
        }
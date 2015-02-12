from __future__ import absolute_import, print_function

from urlparse import urlparse
from uuid import uuid4

from bitfield import BitField

from django.conf import settings
from django.core.urlresolvers import reverse
from django.db import models
from django.db.models import Q, F
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone
import six

from cobra.models import Model, BaseManager
from cobra.models import fields
from cobra.models import sane_repr
from cobra.models.utils import slugify_instance
from cobra.core.constants import PLATFORM_TITLES, PLATFORM_LIST
from cobra.core.http import absolute_uri
from cobra.core.loading import get_model, get_classes, get_class
from cobra.core.compat import AUTH_USER_MODEL
from .utils import ProjectStatus

ProjectManager = get_class('project.managers', 'ProjectManager')
ProjectKeyStatus = get_class('project.utils', 'ProjectKeyStatus')


@python_2_unicode_compatible
class AbstractProject(Model):
    """
    Projects are permission based namespaces which generally
    are the top level entry point for all data.
    """
    PLATFORM_CHOICES = tuple(
        (p, PLATFORM_TITLES.get(p, p.title()))
        for p in PLATFORM_LIST
    ) + (('other', 'Other'),)

    slug = models.SlugField(null=True)
    name = models.CharField(max_length=200)
    organization = fields.FlexibleForeignKey('organization.Organization', related_name='+')
    team = fields.FlexibleForeignKey('team.Team', related_name='+')
    public = models.BooleanField(default=False)
    date_added = models.DateTimeField(default=timezone.now)
    status = fields.BoundedPositiveIntegerField(default=0, choices=(
        (ProjectStatus.VISIBLE, _('Active')),
        (ProjectStatus.PENDING_DELETION, _('Pending Deletion')),
        (ProjectStatus.DELETION_IN_PROGRESS, _('Deletion in Progress')),
    ), db_index=True)
    platform = models.CharField(max_length=32, choices=PLATFORM_CHOICES, null=True)

    #svn settings
    # svn_url = models.URLField(_("SVN URL"))
    # svn_username = models.CharField(_("SVN Username"), max_length=30)
    # svn_password = models.CharField(_('SVN Password'), max_length=128)

    objects = ProjectManager(cache_fields=[
        'pk',
        'slug',
    ])

    class Meta:
        abstract = True
        app_label = 'project'
        db_table = 'cobra_project'
        unique_together = (('team', 'slug'), ('organization', 'slug'))

    __repr__ = sane_repr('team_id', 'slug')

    def __str__(self):
        return u'%s (%s)' % (self.name, self.slug)

    def save(self, *args, **kwargs):
        if not self.slug:
            slugify_instance(self, self.name, organization=self.organization)
        super(AbstractProject, self).save(*args, **kwargs)

    def get_absolute_url(self):
        return absolute_uri(reverse('cobra-stream', args=[
            self.organization.slug, self.slug]))

    def merge_to(self, project):
        from cobra.models import (
            Group, GroupTagValue, Event, TagValue
        )

        if not isinstance(project, get_model('project', 'Project')):
            project = self.__class__.objects.get_from_cache(pk=project)

        for group in Group.objects.filter(project=self):
            try:
                other = Group.objects.get(
                    project=project,
                    checksum=group.checksum,
                )
            except Group.DoesNotExist:
                group.update(project=project)
                for model in (Event, GroupTagValue):
                    model.objects.filter(project=self, group=group).update(project=project)
            else:
                Event.objects.filter(group=group).update(group=other)

                for obj in GroupTagValue.objects.filter(group=group):
                    obj2, created = GroupTagValue.objects.get_or_create(
                        project=project,
                        group=group,
                        key=obj.key,
                        value=obj.value,
                        defaults={'times_seen': obj.times_seen}
                    )
                    if not created:
                        obj2.update(times_seen=F('times_seen') + obj.times_seen)

        for fv in TagValue.objects.filter(project=self):
            TagValue.objects.get_or_create(project=project, key=fv.key, value=fv.value)
            fv.delete()
        self.delete()

    def is_internal_project(self):
        for value in (settings.COBRA_FRONTEND_PROJECT, settings.COBRA_PROJECT):
            if str(self.id) == str(value) or str(self.slug) == str(value):
                return True
        return False

    def get_tags(self, with_internal=True):
        from cobra.models import TagKey

        if not hasattr(self, '_tag_cache'):
            tags = self.get_option('tags', None)
            if tags is None:
                tags = [
                    t for t in TagKey.objects.all_keys(self)
                    if with_internal or not t.startswith('sentry:')
                ]
            self._tag_cache = tags
        return self._tag_cache

    # TODO: Make these a mixin
    def update_option(self, *args, **kwargs):
        ProjectOption = get_model('option', 'ProjectOption')

        return ProjectOption.objects.set_value(self, *args, **kwargs)

    def get_option(self, *args, **kwargs):
        ProjectOption = get_model('option', 'ProjectOption')

        return ProjectOption.objects.get_value(self, *args, **kwargs)

    def delete_option(self, *args, **kwargs):
        ProjectOption = get_model('option', 'ProjectOption')

        return ProjectOption.objects.unset_value(self, *args, **kwargs)

    def has_access(self, user, access=None):
        OrganizationMember = get_model('organization', 'OrganizationMember')

        queryset = OrganizationMember.objects.filter(
            Q(teams=self.team) | Q(has_global_access=True),
            user__is_active=True,
            user=user,
            organization=self.organization,
        )
        if access is not None:
            queryset = queryset.filter(type__lte=access)

        return queryset.exists()

    def get_audit_log_data(self):
        return {
            'slug': self.slug,
            'name': self.name,
            'status': self.status,
            'public': self.public,
            'platform': self.platform,
        }


@python_2_unicode_compatible
class AbstractProjectKey(Model):
    project = fields.FlexibleForeignKey('project.Project', related_name='key_set')
    label = models.CharField(max_length=64, blank=True, null=True)
    public_key = models.CharField(max_length=32, unique=True, null=True)
    secret_key = models.CharField(max_length=32, unique=True, null=True)
    user = fields.FlexibleForeignKey(AUTH_USER_MODEL, null=True)
    roles = BitField(flags=(
        # access to post events to the store endpoint
        ('store', 'Event API access'),

        # read/write access to rest API
        ('api', 'Web API access'),
    ), default=['store'])

    status = fields.BoundedPositiveIntegerField(default=0, choices=(
        (ProjectKeyStatus.ACTIVE, _('Active')),
        (ProjectKeyStatus.INACTIVE, _('Inactive')),
    ), db_index=True)

    # For audits
    user_added = fields.FlexibleForeignKey(AUTH_USER_MODEL, null=True, related_name='keys_added_set')
    date_added = models.DateTimeField(default=timezone.now, null=True)

    objects = BaseManager(cache_fields=(
        'public_key',
        'secret_key',
    ))

    class Meta:
        abstract = True
        app_label = 'project'
        db_table = 'cobra_projectkey'

    __repr__ = sane_repr('project_id', 'user_id', 'public_key')

    def __str__(self):
        return six.text_type(self.public_key)

    @classmethod
    def generate_api_key(cls):
        return uuid4().hex

    @property
    def is_active(self):
        return self.status == ProjectKeyStatus.ACTIVE

    def save(self, *args, **kwargs):
        if not self.public_key:
            self.public_key = self.__class__.generate_api_key()
        if not self.secret_key:
            self.secret_key = self.__class__.generate_api_key()
        super(AbstractProjectKey, self).save(*args, **kwargs)

    def get_dsn(self, domain=None, secure=True, public=False):
        if not public:
            key = '%s:%s' % (self.public_key, self.secret_key)
            url = settings.COBRA_ENDPOINT
        else:
            key = self.public_key
            url = settings.COBRA_PUBLIC_ENDPOINT

        urlparts = urlparse(url or settings.COBRA_URL_PREFIX)

        return '%s://%s@%s/%s' % (
            urlparts.scheme,
            key,
            urlparts.netloc + urlparts.path,
            self.project_id,
        )

    @property
    def dsn_private(self):
        return self.get_dsn(public=False)

    @property
    def dsn_public(self):
        return self.get_dsn(public=True)

    def get_audit_log_data(self):
        return {
            'label': self.label,
            'user_id': self.user_id,
            'public_key': self.public_key,
            'secret_key': self.secret_key,
            'roles': int(self.roles),
            'status': self.status,
        }
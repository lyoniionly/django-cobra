from __future__ import absolute_import, print_function

from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone

from cobra.models import Model
from cobra.models import fields
from cobra.models import sane_repr
from cobra.core.compat import AUTH_USER_MODEL
from cobra.core.loading import get_classes

UserOptionManager, ProjectOptionManager = get_classes('option.managers', ['UserOptionManager', 'ProjectOptionManager'])

@python_2_unicode_compatible
class AbstractOption(Model):
    """
    Global options which apply in most situations as defaults,
    and generally can be overwritten by per-project options.

    Options which are specific to a plugin should namespace
    their key. e.g. key='myplugin:optname'
    """
    key = models.CharField(max_length=64, unique=True)
    value = fields.UnicodePickledObjectField()
    last_updated = models.DateTimeField(default=timezone.now)

    class Meta:
        abstract = True
        app_label = 'option'
        db_table = 'cobra_option'

    __repr__ = sane_repr('key', 'value')

    def __str__(self):
        return self.key


# TODO(dcramer): the NULL UNIQUE constraint here isnt valid, and instead has to
# be manually replaced in the database. We should restructure this model.
@python_2_unicode_compatible
class AbstractUserOption(Model):
    """
    User options apply only to a user, and optionally a project.

    Options which are specific to a plugin should namespace
    their key. e.g. key='myplugin:optname'
    """
    user = fields.FlexibleForeignKey(AUTH_USER_MODEL, related_name='+')
    project = fields.FlexibleForeignKey('project.Project', related_name='+', null=True)
    key = models.CharField(max_length=64)
    value = fields.UnicodePickledObjectField()

    objects = UserOptionManager()

    class Meta:
        abstract = True
        app_label = 'option'
        db_table = 'cobra_useroption'
        verbose_name = _('User Option')
        verbose_name_plural = _('User Options')
        unique_together = (('user', 'project', 'key',),)

    __repr__ = sane_repr('user_id', 'project_id', 'key', 'value')

    def __str__(self):
        return self.user.username + self.key


@python_2_unicode_compatible
class AbstractProjectOption(Model):
    """
    Project options apply only to an instance of a project.

    Options which are specific to a plugin should namespace
    their key. e.g. key='myplugin:optname'
    """
    project = fields.FlexibleForeignKey('project.Project', related_name='+')
    key = models.CharField(max_length=64)
    value = fields.UnicodePickledObjectField()

    objects = ProjectOptionManager()

    class Meta:
        abstract = True
        app_label = 'option'
        db_table = 'cobra_projectoptions'
        unique_together = (('project', 'key',),)

    __repr__ = sane_repr('project_id', 'key', 'value')

    def __str__(self):
        return '%s - %s' % (self.project.name, self.key)

from __future__ import absolute_import, print_function

from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils import timezone

from cobra.core.compat import AUTH_USER_MODEL
from cobra.core.constants import MEMBER_TYPES, MEMBER_USER
from cobra.models import Model
from cobra.models import fields
from cobra.models import sane_repr


@python_2_unicode_compatible
class AbstractAccessGroup(Model):
    """
    An access group identifies a set of members with a defined set
    of permissions (and project access) for a Team.

    Groups may be automated through extensions (such as LDAP) so that
    membership is automatically maintained. If this is the case the
    ``managed`` attribute will be ``True``.
    """
    team = fields.FlexibleForeignKey('team.Team', related_name='+')
    name = models.CharField(max_length=64)
    type = fields.BoundedIntegerField(choices=MEMBER_TYPES, default=MEMBER_USER)
    managed = models.BooleanField(default=False)
    data = fields.GzippedDictField(blank=True, null=True)
    date_added = models.DateTimeField(default=timezone.now)

    projects = models.ManyToManyField('project.Project', related_name='+')
    members = models.ManyToManyField(AUTH_USER_MODEL)

    # objects = BaseManager()

    class Meta:
        abstract = True
        app_label = 'accessgroup'
        db_table = 'cobra_accessgroup'
        unique_together = (('team', 'name'),)

    __repr__ = sane_repr('team_id', 'name', 'type', 'managed')

    def __str__(self):
        return self.name

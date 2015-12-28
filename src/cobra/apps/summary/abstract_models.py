# coding=utf-8

from __future__ import absolute_import, print_function
from datetime import datetime
from django.conf import settings
from django.contrib.contenttypes.models import ContentType

from django.db import models
from django.utils.dateparse import parse_datetime
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _
from django.utils.translation import ugettext
from django.utils import timezone

from cobra.core.compat import AUTH_USER_MODEL
from cobra.models import Model
from cobra.models import fields
from cobra.models import sane_repr
from cobra.core.loading import get_model
from cobra.core.dates import epoch

from .constants import WORK_REPORT_TYPE_WEEK


@python_2_unicode_compatible
class AbstractWorkReport(Model):
    """
    """
    organization = fields.FlexibleForeignKey('organization.Organization')
    owner = fields.FlexibleForeignKey(AUTH_USER_MODEL)
    content = models.TextField(_('Content'), null=True, blank=True)
    summary = models.TextField(_('Summary'), null=True, blank=True)
    plan = models.TextField(_('Plan'), null=True, blank=True)
    type = models.CharField(_('Work Report Type'), max_length=10)
    year = models.IntegerField(_('Year'))
    serial_number = models.IntegerField(_('Serial Number'), null=True, blank=True)

    created_datetime = models.DateTimeField(_('Created at'), auto_now_add=True)
    updated_datetime = models.DateTimeField(_('Last Modified'), auto_now=True)

    class Meta:
        abstract = True
        app_label = 'summary'
        db_table = 'cobra_summary'

    __repr__ = sane_repr('organization_id', 'owner_id')

    def __str__(self):
        return '%s %d %d (%s)' % (self.owner, self.year, self.serial_number, self.type)

    def get_absolute_url(self):
        # return absolute_uri(reverse('cobra-team-dashboard', args=[
        #     self.organization.slug,
        #     self.slug,
        # ]))
        return 'Do not set'

    def get_owner_name(self):
        if not self.owner:
            return None
        if self.owner.first_name:
            return self.owner.first_name
        if self.owner.email:
            return self.owner.email.split('@', 1)[0]
        return self.owner.username

    def to_dict(self):
        UserShare = get_model('share', 'UserShare')
        name = ''
        if self.type == WORK_REPORT_TYPE_WEEK:
            name = _("The %(week)d week work report of %(owner_name)s") % {
                'week': self.serial_number, 'owner_name': self.get_owner_name()
            }
        creator = {
            'username': self.owner.username,
            'name': self.get_owner_name(),
            'id': self.owner.id,
            'employeeId': self.owner.id
        }
        work_report = {
            'name': name,
            'creator': creator,
            'createTime': epoch(self.created_datetime, msec=True),
            'lastUpdateTime': epoch(self.updated_datetime, msec=True),
            'module': 'workreport',
            'title': name,
            'year': self.year,
            'serialNumber': self.serial_number,
            'type': self.type,
            'read': False,
            'id': self.pk
        }

        if self.content:
            work_report.update({
                'content': self.content
            })
        if self.summary:
            work_report.update({
                'summary': self.summary
            })
        if self.plan:
            work_report.update({
                'plan': self.plan
            })

        user_shares = UserShare.objects.filter(
            content_type=ContentType.objects.get_for_model(self),
            object_id=self.pk, share_type='sharer', entry_type='user',
            module='workreport'
        )
        if user_shares:
             work_report.update({
                'shareEntrys': [s.to_dict() for s in user_shares]
            })

        return work_report

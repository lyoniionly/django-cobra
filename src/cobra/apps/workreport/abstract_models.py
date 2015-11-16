from __future__ import absolute_import, print_function
import datetime
from django.conf import settings

from django.db import models
from django.utils.dateparse import parse_datetime
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone
from cobra.apps.workreport.constants import WORKREPORT_STATUS_COMPLETE, WORKREPORT_STATUS_PARTCOMPLETE

from cobra.core.compat import AUTH_USER_MODEL
from cobra.models import Model
from cobra.models import fields
from cobra.models import sane_repr
from cobra.core.loading import get_model


@python_2_unicode_compatible
class AbstractDailyReport(Model):
    """

    """
    project = fields.FlexibleForeignKey('project.Project')
    owner = fields.FlexibleForeignKey(AUTH_USER_MODEL)
    desc = models.TextField(_('Description'), max_length=2048, null=True, blank=True)
    code_content = models.TextField(_('Code Content'), null=True, blank=True)

    which_date = models.DateField()  # this daily report belong to which date
    published_datetime = models.DateTimeField(default=timezone.now, null=True)  # this daily report submit date

    class Meta:
        abstract = True
        app_label = 'workreport'
        db_table = 'cobra_workreport_daily'
        unique_together = (('project', 'owner', 'which_date'),)

    __repr__ = sane_repr('project_id', 'owner_id', 'which_date')

    def __str__(self):
        return '%s (%s)' % (self.owner, self.which_date.strftime('%Y/%m/%d'))

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

    @property
    def is_submit_ontime(self):
        DailyDeadline = get_model('workreport', 'DailyDeadline')
        try:
            dd = DailyDeadline.objects.get(project=self.project)
            deadline = str(dd.deadline_time)
        except Exception as e:
            deadline = settings.COBRA_WORKREPORT_DAILY_DEADLINE
        from django.utils.timezone import get_current_timezone
        from datetime import datetime
        tz = get_current_timezone()
        deadline_time = tz.localize(datetime.strptime(self.which_date.strftime('%Y-%m-%d') + ' ' + deadline, '%Y-%m-%d %H:%M:%S'))
        if self.published_datetime > deadline_time:
            return False
        else:
            return True

    @property
    def submit_status_desc(self):
        if self.is_submit_ontime:
            return _('Submit On Time')
        else:
            return _('Late submission')

    @property
    def report_status(self):
        if self.is_submit_ontime:
            return WORKREPORT_STATUS_COMPLETE
        else:
            return WORKREPORT_STATUS_PARTCOMPLETE

    def get_finished_tasks(self):
        return self.daily_report_finished_tasks.all()

    @property
    def finished_tasks_count(self):
        return self.daily_report_finished_tasks.count()

    @property
    def finished_tasks_cost_time(self):
        tasks = self.get_finished_tasks()
        hour = 0
        for task in tasks:
            hour += task.hour
        return hour

    @property
    def code_line_count(self):
        lines = [s for s in self.code_content.splitlines() if s]
        return len(lines)



@python_2_unicode_compatible
class AbstractDailyFinishedTask(Model):
    """
    """
    daily_report = fields.FlexibleForeignKey('workreport.DailyReport', related_name='daily_report_finished_tasks')
    desc = models.TextField(_('Task Description'), max_length=1000)
    hour = fields.BoundedIntegerField(choices=(
        (0, _('0 hour')),
        (1, _('1 hour')),
        (2, _('2 hour')),
        (3, _('3 hour')),
        (4, _('4 hour')),
        (5, _('5 hour')),
        (6, _('6 hour')),
        (7, _('7 hour')),
        (8, _('8 hour')),
        (9, _('9 hour')),
        (10, _('10 hour')),
        (11, _('11 hour')),
        (12, _('12 hour')),
    ), default=1)

    class Meta:
        abstract = True
        app_label = 'workreport'
        db_table = 'cobra_workreport_daily_finished_task'

    __repr__ = sane_repr('daily_report_id', 'desc', 'hour')

    def __str__(self):
        return '%s - %s' % (self.daily_report, self.hour)


@python_2_unicode_compatible
class AbstractDailyDeadline(Model):
    """
    """
    project = fields.FlexibleForeignKey('project.Project')
    deadline_time = models.TimeField()

    class Meta:
        abstract = True
        app_label = 'workreport'
        db_table = 'cobra_workreport_daily_deadline'

    __repr__ = sane_repr('project_id', 'deadline_time')

    def __str__(self):
        return '%s' % (self.project.name)
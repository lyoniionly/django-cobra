from __future__ import absolute_import
import calendar
from collections import OrderedDict
import collections
from braces.views import JSONResponseMixin
import datetime
from django.utils.dates import MONTHS
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.generic import View
from cobra.apps.workreport.constants import WORKREPORT_STATUS_INCOMPLETE, WORKREPORT_STATUS_DEFAULT
from cobra.core.loading import get_model, get_class
from django.utils.translation import ugettext_lazy as _
from django.views import generic
from cobra.views.generic import ProjectView
from cobra.views.mixins import DailyMixin
from cobra.core.utils import date_from_string, get_datetime_now
from cobra.core.calendar import get_calendar_first_weekday


class DailyReportView(DailyMixin, ProjectView):
    def get(self, request, organization, team, project, *args, **kwargs):

        year = self.get_year()
        month = self.get_month()
        day = self.get_day()
        filter_date = date_from_string(year, self.get_year_format(),
                                 month, self.get_month_format(),
                                 day, self.get_day_format())

        context = {
            'active_nav': 'daily_report',
            'active_tab': 'mine',
            'selected_years': self._get_selected_years(),
            'filter_date': filter_date,
            'months': self._get_months()
        }

        return self.respond('organization/project/workreport/daily/my_report.html', context)

    def _get_selected_years(self):
        now = get_datetime_now()
        years = []
        for i in [0, 1, 2, 3]:
            years.append(now.year - i)
        return years

    def _get_months(self):
        return OrderedDict((
            ('Jan', _('January')), ('Feb', _('February')), ('Mar', _('March')), ('Apr', _('April')), ('May', _('May')), ('Jun', _('June')),
            ('Jul', _('July')), ('Aug', _('August')), ('Sep', _('September')), ('Oct', _('October')), ('Nov', _('November')),
            ('Dec', _('December'))
        ))


class AjaxWorkreportStatisticView(JSONResponseMixin, ProjectView):
    def get(self, request, organization, team, project, *args, **kwargs):

        statistic = self.get_work_report_statistic(request)

        context = {
            'calendar': statistic
        }
        return self.render_json_response(context)

    def get_query(self, start_date, end_date, is_team, report_type):
        queryset = [
            {"date":"2015/11/05", "status":3}, {"date":"2015/11/09", "status":1}, {"date":"2015/11/07", "status":2},
            {"date":"2016/01/07", "status":1}
        ]
        return queryset

    def get_work_report_statistic(self, request):
        year = int(request.GET.get('year'))
        month = int(request.GET.get('month'))
        is_team = bool(int(request.GET.get('isTeam', 0)))
        report_type = request.GET.get('reportType', 'daily')
        date_list = []
        first_weekday = get_calendar_first_weekday()
        for d in calendar.Calendar(first_weekday).itermonthdates(year, month):
            date_list.append(d)

        if len(date_list) < 42:
            last_date = date_list[-1]
            for i in range(1, 8):
                date_list.append(last_date + datetime.timedelta(i))

        queryset = self.get_query(date_list[0], date_list[-1], is_team, report_type)
        statistic = []
        for d in date_list:
            obj = {
                'date': d.strftime('%Y/%m/%d'),
                'status': WORKREPORT_STATUS_INCOMPLETE
            }
            if d > get_datetime_now().date():
                obj['status'] = WORKREPORT_STATUS_DEFAULT
            for q in queryset:
                if q.get('date') == d.strftime('%Y/%m/%d'):
                    obj['status'] = q.get('status')
            statistic.append(obj)

        return statistic

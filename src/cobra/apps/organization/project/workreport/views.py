from __future__ import absolute_import
from collections import OrderedDict
from django.utils.dates import MONTHS
from cobra.core.loading import get_model, get_class
from django.utils.translation import ugettext_lazy as _
from django.views import generic
from cobra.views.generic import ProjectView
from cobra.views.mixins import DailyMixin
from cobra.core.utils import date_from_string, get_datetime_now


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


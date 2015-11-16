from django.conf.urls import url
from django.contrib.auth.decorators import login_required

from cobra.core.application import Application
from cobra.core.loading import get_class


class WorkreportProjectOrganizationApplication(Application):
    name = 'workreport'

    daily_report_view = get_class('organization.project.workreport.views', 'DailyReportView')

    # ajax
    ajax_workreport_statistic_view = get_class('organization.project.workreport.views', 'AjaxWorkreportStatisticView')

    def get_urls(self):
        urls = [
            url(r'^daily/(?P<username>[\@\.\w-]+)/$', login_required(self.daily_report_view.as_view()), name='daily-member'),
            url(r'^daily/(?P<username>[\@\.\w-]+)/(?P<year>[0-9]{4})/$', login_required(self.daily_report_view.as_view()), name='daily-member-year'),
            url(r'^daily/(?P<username>[\@\.\w-]+)/(?P<year>[0-9]{4})/(?P<month>[-\w]+)/$', login_required(self.daily_report_view.as_view()), name='daily-member-month'),
            url(r'^daily/(?P<username>[\@\.\w-]+)/(?P<year>[0-9]{4})/(?P<month>[-\w]+)/(?P<day>[0-9]+)/$', login_required(self.daily_report_view.as_view()), name='daily-member-day'),

            # team daily report
            # url(r'^daily/team/$', self.daily_team_report_view.as_view(), name='daily-team-report-view'),

            # ajax
            url(r'^ajax/statistic/(?P<username>[\@\.\w-]+)/$', login_required(self.ajax_workreport_statistic_view.as_view()), name='ajax-workreport-statistic'),
        ]
        return self.post_process_urls(urls)


application = WorkreportProjectOrganizationApplication()

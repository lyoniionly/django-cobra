from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class WorkreportProjectOrganizationApplication(Application):
    name = 'workreport'

    daily_report_view = get_class('organization.project.workreport.views', 'DailyReportView')

    # ajax
    ajax_workreport_statistic_view = get_class('organization.project.workreport.views', 'AjaxWorkreportStatisticView')

    def get_urls(self):
        urls = [
            url(r'^daily/mine/$', self.daily_report_view.as_view(), name='daily-mine'),
            url(r'^daily/mine/(?P<year>[0-9]{4})/$', self.daily_report_view.as_view(), name='daily-mine-year'),
            url(r'^daily/mine/(?P<year>[0-9]{4})/(?P<month>[-\w]+)/$', self.daily_report_view.as_view(), name='daily-mine-month'),
            url(r'^daily/mine/(?P<year>[0-9]{4})/(?P<month>[-\w]+)/(?P<day>[0-9]+)/$', self.daily_report_view.as_view(), name='daily-mine-day'),

            # team daily report
            # url(r'^daily/team/$', self.daily_team_report_view.as_view(), name='daily-team-report-view'),

            # ajax
            url(r'^ajax/statistic/$', self.ajax_workreport_statistic_view.as_view(), name='ajax-workreport-statistic'),
        ]
        return self.post_process_urls(urls)


application = WorkreportProjectOrganizationApplication()

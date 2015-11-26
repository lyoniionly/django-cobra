from django.conf.urls import url
from django.contrib.auth.decorators import login_required

from cobra.core.application import Application
from cobra.core.loading import get_class


class WorkreportOrganizationApplication(Application):
    name = 'workreport'

    daily_report_view = get_class('organization.workreport.views', 'DailyReportView')
    daily_report_edit_view = get_class('organization.workreport.views', 'DailyReportEditView')

    daily_report_members_index_view = get_class('organization.workreport.views', 'DailyReportMembersIndexView')

    daily_team_report_view = get_class('organization.workreport.views', 'DailyTeamReportView')

    daily_report_list_view = get_class('organization.workreport.views', 'DailyReportListView')

    # ajax
    ajax_workreport_statistic_view = get_class('organization.workreport.views', 'AjaxWorkreportStatisticView')
    ajax_daily_report_settings_view = get_class('organization.workreport.views', 'AjaxDailyReportSettingsView')


    def get_urls(self):
        urls = [
            url(r'^daily/(?P<username>[\@\.\w-]+)/$', login_required(self.daily_report_view.as_view()), name='daily-member'),
            url(r'^daily/(?P<username>[\@\.\w-]+)/(?P<year>[0-9]{4})/$', login_required(self.daily_report_view.as_view()), name='daily-member-year'),
            url(r'^daily/(?P<username>[\@\.\w-]+)/(?P<year>[0-9]{4})/(?P<month>[-\w]+)/$', login_required(self.daily_report_view.as_view()), name='daily-member-month'),
            url(r'^daily/(?P<username>[\@\.\w-]+)/(?P<year>[0-9]{4})/(?P<month>[-\w]+)/(?P<day>[0-9]+)/$', login_required(self.daily_report_view.as_view()), name='daily-member-day'),

            url(r'^daily/(?P<year>[0-9]{4})/(?P<month>[-\w]+)/(?P<day>[0-9]+)/edit/$', login_required(self.daily_report_edit_view.as_view()), name='daily-report-edit'),

            url(r'^daily/members/index/$', login_required(self.daily_report_members_index_view.as_view()), name='daily-members-index'),

            url(r'^daily/(?P<username>[\@\.\w-]+)/list/$', login_required(self.daily_report_list_view.as_view()), name='daily-member-report-list'),

            # team daily report
            url(r'^daily/team/report/$', login_required(self.daily_team_report_view.as_view()), name='daily-team-report'),
            url(r'^daily/team/report/(?P<year>[0-9]{4})/$', login_required(self.daily_team_report_view.as_view()), name='daily-team-report-year'),
            url(r'^daily/team/report/(?P<year>[0-9]{4})/(?P<month>[-\w]+)/$', login_required(self.daily_team_report_view.as_view()), name='daily-team-report-month'),
            url(r'^daily/team/report/(?P<year>[0-9]{4})/(?P<month>[-\w]+)/(?P<day>[0-9]+)/$', login_required(self.daily_team_report_view.as_view()), name='daily-team-report-day'),

            # ajax
            url(r'^ajax/statistic/$', login_required(self.ajax_workreport_statistic_view.as_view()), name='ajax-workreport-statistic'),
            url(r'^ajax/dailyreport/settings/$', self.ajax_daily_report_settings_view.as_view(),
                name='daily-report-settings'),
        ]
        return self.post_process_urls(urls)


application = WorkreportOrganizationApplication()

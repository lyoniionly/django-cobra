from django.conf.urls import url
from django.contrib.auth.decorators import login_required

from cobra.core.application import Application
from cobra.core.loading import get_class


class SummaryOrganizationApplication(Application):
    name = 'summary'

    summary_report_view = get_class('organization.summary.views', 'SummaryReportView')

    def get_urls(self):
        urls = [
            url(r'^summary/(?P<username>[\@\.\w-]+)/$', login_required(self.summary_report_view.as_view()), name='summary-member'),

        ]
        return self.post_process_urls(urls)


application = SummaryOrganizationApplication()

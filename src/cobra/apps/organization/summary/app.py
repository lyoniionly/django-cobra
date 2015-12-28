from django.conf.urls import url
from django.contrib.auth.decorators import login_required

from cobra.core.application import Application
from cobra.core.loading import get_class


class SummaryOrganizationApplication(Application):
    name = 'summary'

    summary_report_view = get_class('organization.summary.views', 'SummaryReportView')

    # ajax
    ajax_view = get_class('organization.summary.ajax', 'AjaxView')
    ajax_workreport_view = get_class('organization.summary.ajax', 'AjaxWorkreportView')
    ajax_update_workreport_view = get_class('organization.summary.ajax', 'AjaxUpdateWorkreportView')

    def get_urls(self):
        urls = [
            url(r'^(?P<username>[\@\.\w-]+)/$', login_required(self.summary_report_view.as_view()), name='summary-member'),

            # ajax
            url(r'^ajax/view.json$', login_required(self.ajax_view.as_view()), name='ajax-summary-view'),
            url(r'^ajax/workreport.json$', login_required(self.ajax_workreport_view.as_view()), name='ajax-workreport-view'),
            url(r'^ajax/(?P<pk>[0-9]+).json$', login_required(self.ajax_update_workreport_view.as_view()), name='ajax-update-workreport-view'),

        ]
        return self.post_process_urls(urls)


application = SummaryOrganizationApplication()

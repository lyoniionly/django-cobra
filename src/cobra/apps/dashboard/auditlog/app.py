from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class AuditlogDashboardApplication(Application):
    name = None

    list_view = get_class('dashboard.auditlog.views', 'ListView')

    def get_urls(self):
        urls = [
            url(r'^$', self.list_view.as_view(), name='auditlog-list'),
        ]
        return self.post_process_urls(urls)


application = AuditlogDashboardApplication()

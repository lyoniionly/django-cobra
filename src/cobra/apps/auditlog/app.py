from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class AuditLogApplication(Application):
    name = 'auditlog'
    for_organization_view = get_class('auditlog.views', 'ForOrganizationView')

    def get_urls(self):
        urls = [
            url(r'^for/organization/(?P<organization_slug>[\w_-]+)/$', self.for_organization_view.as_view(),
                name='for-organization'),
        ]
        return self.post_process_urls(urls)


application = AuditLogApplication()

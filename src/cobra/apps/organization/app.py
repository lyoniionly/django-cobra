from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class OrganizationApplication(Application):
    name = 'organization'
    organization_home_view = get_class('organization.views', 'OrganizationHomeView')
    organization_create_view = get_class('organization.views', 'OrganizationCreateView')

    def get_urls(self):
        urls = [
            url(r'^(?P<organization_slug>(?!create)[\w_-]+)/$', self.organization_home_view.as_view(),
                name='home'),
            url(r'^create/$', self.organization_create_view.as_view(),
                name='create'),
        ]
        return self.post_process_urls(urls)


application = OrganizationApplication()

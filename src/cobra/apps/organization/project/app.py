from django.conf.urls import url, include

from cobra.core.application import Application
from cobra.core.loading import get_class


class ProjectOrganizationApplication(Application):
    name = 'project'

    overview_view = get_class('organization.project.views', 'OverviewView')

    # workreport_app = get_class('organization.project.workreport.app', 'application')

    def get_urls(self):
        urls = [
            url(r'^(?P<project_slug>[\w_-]+)/overview/$', self.overview_view.as_view(), name='overview'),

            # url(r'^(?P<project_slug>[\w_-]+)/workreport/', include(self.workreport_app.urls)),
        ]
        return self.post_process_urls(urls)


application = ProjectOrganizationApplication()

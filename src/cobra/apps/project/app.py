from __future__ import absolute_import

from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class ProjectApplication(Application):
    name = 'project'
    project_create_view = get_class('project.views', 'ProjectCreateView')

    def get_urls(self):
        urls = [
            url(r'^create/for/organizations/(?P<organization_slug>[\w_-]+)/$', self.project_create_view.as_view(),
                name='create'),
        ]
        return self.post_process_urls(urls)


application = ProjectApplication()

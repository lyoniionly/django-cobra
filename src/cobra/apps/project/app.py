from __future__ import absolute_import

from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class ProjectApplication(Application):
    name = 'project'
    project_create_view = get_class('project.views', 'ProjectCreateView')
    project_settings_view = get_class('project.views', 'ProjectSettingsView')

    def get_urls(self):
        urls = [
            url(r'^create/for/organizations/(?P<organization_slug>[\w_-]+)/$', self.project_create_view.as_view(),
                name='create'),

            url(r'^(?P<project_slug>[\w_-]+)/settings/for/organizations/(?P<organization_slug>[\w_-]+)/$',
                self.project_settings_view.as_view(),
                name='settings'),
        ]
        return self.post_process_urls(urls)


application = ProjectApplication()

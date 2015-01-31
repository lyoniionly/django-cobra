from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class TeamApplication(Application):
    name = 'team'
    team_create_view = get_class('team.views', 'TeamCreateView')
    team_settings_view = get_class('team.views', 'TeamSettingsView')
    team_remove_view = get_class('team.views', 'TeamRemoveView')

    def get_urls(self):
        urls = [
            url(r'^create/for/organizations/(?P<organization_slug>[\w_-]+)/$', self.team_create_view.as_view(),
                name='create'),
            url(r'^(?P<team_slug>[\w_-]+)/settings/for/organizations/(?P<organization_slug>[\w_-]+)/$', self.team_settings_view.as_view(),
                name='manage'),
            url(r'^(?P<team_slug>[\w_-]+)/remove/for/organizations/(?P<organization_slug>[\w_-]+)/$', self.team_remove_view.as_view(),
                name='remove'),
        ]
        return self.post_process_urls(urls)


application = TeamApplication()

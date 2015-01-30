from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class TeamApplication(Application):
    name = 'team'
    team_create_view = get_class('team.views', 'TeamCreateView')

    def get_urls(self):
        urls = [
            url(r'^create/for/organizations/(?P<organization_slug>[\w_-]+)/$', self.team_create_view.as_view(),
                name='create'),
        ]
        return self.post_process_urls(urls)


application = TeamApplication()

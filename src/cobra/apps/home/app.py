from django.conf.urls import url
from django.contrib.auth.decorators import login_required

from cobra.core.application import Application
from cobra.core.loading import get_class


class HomeApplication(Application):
    name = 'home'

    home_view = get_class('home.views', 'HomeView')
    help_view = get_class('home.views', 'HelpView')

    def get_urls(self):
        urls = [
            url(r'^$', self.home_view.as_view(), name='home'),

            url(r'^help/$', login_required(self.help_view.as_view()), name='help'),
        ]
        return self.post_process_urls(urls)


application = HomeApplication()

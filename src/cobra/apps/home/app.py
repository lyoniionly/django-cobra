from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class HomeApplication(Application):
    name = 'home'

    home_view = get_class('home.views', 'HomeView')

    def get_urls(self):
        urls = [
            url(r'^$', self.home_view.as_view(), name='home'),
        ]
        return self.post_process_urls(urls)


application = HomeApplication()

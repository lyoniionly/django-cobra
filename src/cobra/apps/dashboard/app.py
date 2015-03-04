from django.conf.urls import url, include
from django.contrib.auth.decorators import login_required

from cobra.core.application import Application
from cobra.core.loading import get_class


class DashboardApplication(Application):
    name = 'dashboard'

    index_view = get_class('dashboard.views', 'IndexView')

    def get_urls(self):
        urls = [
            url(r'^$', login_required(self.index_view.as_view()), name='index'),
        ]
        return self.post_process_urls(urls)


application = DashboardApplication()

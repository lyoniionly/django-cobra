from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class AutoCheckDashboardApplication(Application):
    name = None

    index_view = get_class('dashboard.autocheck.views', 'IndexView')

    def get_urls(self):
        urls = [
            url(r'^$', self.index_view.as_view(), name='autocheck-index'),

        ]
        return self.post_process_urls(urls)


application = AutoCheckDashboardApplication()

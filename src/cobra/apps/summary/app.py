from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class SummaryApplication(Application):
    name = 'summary'

    def get_urls(self):
        urls = [

        ]
        return self.post_process_urls(urls)


application = SummaryApplication()

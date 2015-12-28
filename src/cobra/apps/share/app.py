from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class ShareApplication(Application):
    name = 'share'

    add_user_view = get_class('share.views', 'AddUserView')

    def get_urls(self):
        urls = [
            url(r'^addUser.json$', self.add_user_view.as_view(),
                name='add-user'),
        ]
        return self.post_process_urls(urls)


application = ShareApplication()

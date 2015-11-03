from django.conf.urls import url, include
from django.contrib.auth.decorators import login_required

from cobra.core.application import Application
from cobra.core.loading import get_class


class DashboardApplication(Application):
    name = 'dashboard'

    index_view = get_class('dashboard.views', 'IndexView')
    auditlog_app = get_class('dashboard.auditlog.app', 'application')
    autocheck_app = get_class('dashboard.autocheck.app', 'application')

    def get_urls(self):
        urls = [
            url(r'^$', login_required(self.index_view.as_view()), name='index'),

            url(r'^auditlog/', include(self.auditlog_app.urls)),
            url(r'^autocheck/', include(self.autocheck_app.urls)),
        ]
        return self.post_process_urls(urls)


application = DashboardApplication()

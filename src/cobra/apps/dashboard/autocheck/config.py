from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class AutoCheckDashboardConfig(AppConfig):
    label = 'autocheck_dashboard'
    name = 'cobra.apps.dashboard.autocheck'
    verbose_name = _('Autocheck dashboard')

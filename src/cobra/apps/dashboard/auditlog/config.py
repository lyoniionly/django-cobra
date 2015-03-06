from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class AuditlogDashboardConfig(AppConfig):
    label = 'auditlog_dashboard'
    name = 'cobra.apps.dashboard.auditlog'
    verbose_name = _('Auditlog dashboard')

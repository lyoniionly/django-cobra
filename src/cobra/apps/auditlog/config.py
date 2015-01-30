from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class AuditLogConfig(AppConfig):
    label = 'auditlog'
    name = 'cobra.apps.auditlog'
    verbose_name = _('Audit Log')
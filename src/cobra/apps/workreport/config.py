from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class WorkreportConfig(AppConfig):
    label = 'workreport'
    name = 'cobra.apps.workreport'
    verbose_name = _('Work Report')

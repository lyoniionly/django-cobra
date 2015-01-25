from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class AccessGroupConfig(AppConfig):
    label = 'accessgroup'
    name = 'cobra.apps.accessgroup'
    verbose_name = _('AccessGroup')

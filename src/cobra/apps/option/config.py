from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class OptionConfig(AppConfig):
    label = 'option'
    name = 'cobra.apps.option'
    verbose_name = _('Option')

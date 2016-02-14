from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class MenuConfig(AppConfig):
    label = 'menu'
    name = 'cobra.apps.menu'
    verbose_name = _('Menu')

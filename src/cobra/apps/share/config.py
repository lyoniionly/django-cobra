from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class ShareConfig(AppConfig):
    label = 'share'
    name = 'cobra.apps.share'
    verbose_name = _('Share')

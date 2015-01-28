from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class AccountsConfig(AppConfig):
    label = 'accounts'
    name = 'cobra.apps.accounts'
    verbose_name = _('Accounts')

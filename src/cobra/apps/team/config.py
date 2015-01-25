from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class TeamConfig(AppConfig):
    label = 'team'
    name = 'cobra.apps.team'
    verbose_name = _('Team')

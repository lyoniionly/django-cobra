from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class SummaryConfig(AppConfig):
    label = 'summary'
    name = 'cobra.apps.summary'
    verbose_name = _('Summary Report')

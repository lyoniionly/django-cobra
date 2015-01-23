from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class OrganizationConfig(AppConfig):
    label = 'organization'
    name = 'cobra.apps.organization'
    verbose_name = _('Organization')

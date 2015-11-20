from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class WorkreportOrganizationConfig(AppConfig):
    label = 'workreport_organization'
    name = 'cobra.apps.organization.workreport'
    verbose_name = _('Workreport Organization')

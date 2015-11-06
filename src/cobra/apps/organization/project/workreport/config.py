from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class WorkreportProjectOrganizationConfig(AppConfig):
    label = 'workreport_project_organization'
    name = 'cobra.apps.organization.project.workreport'
    verbose_name = _('Workreport Project Organization')

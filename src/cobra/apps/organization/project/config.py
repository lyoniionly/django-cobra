from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class ProjectOrganizationConfig(AppConfig):
    label = 'project_organization'
    name = 'cobra.apps.organization.project'
    verbose_name = _('Project organization')

from __future__ import absolute_import

from cobra.views.generic import OrganizationView
from cobra.core.loading import get_model, get_class

AuditLogEntry = get_model('auditlog', 'AuditLogEntry')
OrganizationMemberType = get_class('organization.utils', 'OrganizationMemberType')

class ForOrganizationView(OrganizationView):
    required_access = OrganizationMemberType.ADMIN

    def get(self, request, organization):
        queryset = AuditLogEntry.objects.filter(
            organization=organization,
        ).select_related('actor', 'target_user').order_by('-datetime')

        context = {
            'audit_log_queryset': queryset,
        }

        return self.respond('auditlog/organization-audit-log.html', context)
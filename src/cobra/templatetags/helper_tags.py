from __future__ import absolute_import

from django import template

from cobra.core.javascript import to_json
from cobra.core.loading import get_model, get_class

register = template.Library()

register.filter(to_json)

@register.filter
def needs_access_group_migration(user, organization):
    AccessGroup = get_model('accessgroup', 'AccessGroup')
    OrganizationMember = get_model('organization', 'OrganizationMember')
    OrganizationMemberType = get_class('organization.utils', 'OrganizationMemberType')

    has_org_access_queryset = OrganizationMember.objects.filter(
        user=user,
        organization=organization,
        has_global_access=True,
        type__lte=OrganizationMemberType.ADMIN,
    )

    if not (user.is_superuser or has_org_access_queryset.exists()):
        return False

    return AccessGroup.objects.filter(
        team__organization=organization
    ).exists()

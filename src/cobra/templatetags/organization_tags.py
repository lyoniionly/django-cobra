from collections import defaultdict
from django import template
from django.db.models import Q
from cobra.core.loading import get_model

register = template.Library()

Organization = get_model('organization', 'Organization')
OrganizationMember = get_model('organization', 'OrganizationMember')

@register.filter
def list_organizations(user):
    return Organization.objects.get_for_user(user)


@register.filter
def organization_members(organization, with_invited=False):
    if with_invited:
        queryset = OrganizationMember.objects.filter(
            organization=organization,
        ).select_related('user')
    else:
        queryset = OrganizationMember.objects.filter(
            Q(user__isnull=False) & Q(user__is_active=True),
            organization=organization,
        ).select_related('user')

    queryset = sorted(queryset, key=lambda x: x.user.get_display_name() or x.email)

    return queryset
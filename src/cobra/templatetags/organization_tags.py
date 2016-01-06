from collections import defaultdict
from django import template
from django.db.models import Q
from django.utils.safestring import SafeString
from cobra.apps.accounts.utils import get_user_info
from cobra.core.loading import get_model
from cobra.core.permissions import is_organization_admin, can_manage_org

## Django 1.5+ compat
try:
    import json
except ImportError:  # pragma: no cover
    from django.utils import simplejson as json

register = template.Library()

Organization = get_model('organization', 'Organization')
OrganizationMember = get_model('organization', 'OrganizationMember')

@register.filter
def list_organizations(user):
    return Organization.objects.get_for_user(user)


@register.filter
def organization_members(organization):

    queryset = OrganizationMember.objects.filter(
        Q(user__isnull=False) & Q(user__is_active=True),
        organization=organization,
    ).select_related('user')

    queryset = sorted(queryset, key=lambda x: x.user.get_display_name() or x.email)

    return queryset


@register.assignment_tag
def organization_members_with_filter(organization, with_invited=False, limit=None):
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
    if limit:
        queryset = queryset[0:limit]

    return queryset


@register.filter
def has_subordinates(user, organization):
    '''
    If the user is the admin of the organization,
    and the organization has other members except this user,
    we consider that the user has subordinate
    '''
    if is_organization_admin(user, organization) and len(organization_members(organization)) > 1:
        return True
    else:
        return False


@register.assignment_tag
def organization_current_user(organization, user):
    current_user = get_user_info(user)
    current_user['admin'] = can_manage_org(user, organization)
    return SafeString(json.dumps(current_user))
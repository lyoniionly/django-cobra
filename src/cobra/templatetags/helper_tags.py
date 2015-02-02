from __future__ import absolute_import

from django import template
from django.template import RequestContext
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe

from paging.helpers import paginate as paginate_func
from templatetag_sugar.register import tag
from templatetag_sugar.parser import Name, Variable, Constant, Optional

from cobra.core.javascript import to_json
from cobra.core.loading import get_model, get_class
from cobra.core.constants import EVENTS_PER_PAGE

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


# XXX: this is taken from django-paging so that we may render
#      a custom template, and not worry about INSTALLED_APPS
@tag(register, [Variable('queryset_or_list'),
                Constant('from'), Variable('request'),
                Optional([Constant('as'), Name('asvar')]),
                Optional([Constant('per_page'), Variable('per_page')])])
def paginate(context, queryset_or_list, request, asvar=None, per_page=EVENTS_PER_PAGE):
    """{% paginate queryset_or_list from request as foo[ per_page 25] %}"""
    result = paginate_func(request, queryset_or_list, per_page, endless=True)

    context_instance = RequestContext(request)
    paging = mark_safe(render_to_string('partials/pagination.html', result, context_instance))

    result = dict(objects=result['paginator'].get('objects', []), paging=paging)

    if asvar:
        context[asvar] = result
        return ''
    return result


@tag(register, [Variable('queryset_or_list'),
                Constant('from'), Variable('request'),
                Optional([Constant('as'), Name('asvar')]),
                Optional([Constant('per_page'), Variable('per_page')])])
def paginator(context, queryset_or_list, request, asvar=None, per_page=EVENTS_PER_PAGE):
    """{% paginator queryset_or_list from request as foo[ per_page 25] %}"""
    result = paginate_func(request, queryset_or_list, per_page, endless=True)

    if asvar:
        context[asvar] = result
        return ''
    return result
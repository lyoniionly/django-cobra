from __future__ import absolute_import

from datetime import timedelta

from django import template
from django.conf import settings
from django.template import RequestContext
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext as _

from paging.helpers import paginate as paginate_func
from templatetag_sugar.register import tag
from templatetag_sugar.parser import Name, Variable, Constant, Optional

from cobra.apps.accounts.utils import get_gravatar
from cobra.core.javascript import to_json
from cobra.core.loading import get_model, get_class, get_profile_class
from cobra.core.constants import EVENTS_PER_PAGE
from cobra.core.utils import multi_get_letter

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


@register.simple_tag
def get_avatar_url(user, email=''):
    if user is None:
        # This situation is really exist.
        # When we invite the member to join the organization,
        # the organization member DB only store the email, but not the user instance.
        # If the invited member do not accept the invitation yet, the organization member list page
        # will contain all member include invited member, so, we should deal the user(none) avatar

        # Use Gravatar if the user wants to.
        if settings.COBRA_ACCOUNTS_AVATAR_GRAVATAR:
            return get_gravatar(email,
                                settings.COBRA_ACCOUNTS_AVATAR_SIZE,
                                settings.COBRA_ACCOUNTS_AVATAR_DEFAULT)

        # Gravatar not used, check for a default image.
        else:
            if settings.COBRA_ACCOUNTS_AVATAR_DEFAULT not in ['404', 'mm',
                                                                'identicon',
                                                                'monsterid',
                                                                'wavatar']:
                return settings.COBRA_ACCOUNTS_AVATAR_DEFAULT
            else:
                return None

    Profile = get_profile_class()
    try:
        instance = Profile.objects.get(user=user)
    except Profile.DoesNotExist:
        # User has no profile, try a blank one
        instance = Profile(user=user)
    return instance.get_avatar_url()


@register.inclusion_tag('partials/project_avatar.html')
def get_project_avatar(project, css_class=''):
    allowed_colors = {
      'red': 'FFEBEE',
      'purple': 'F3E5F5',
      'indigo': 'E8EAF6',
      'blue': 'E3F2FD',
      'teal': 'E0F2F1',
      'orange': 'FBE9E7',
      'gray': 'EEEEEE'
    }
    css_class += ' identicon'
    bg_key = project.id % 7
    style = "background-color: #%s; color: #555" % allowed_colors.values()[bg_key]
    first_cap = multi_get_letter(project.name)[0]
    return {'css_class': css_class, 'style': style, 'first_cap': first_cap.upper()}


@register.filter
def timesince_ago(value, now=None):
    from django.template.defaultfilters import timesince
    if now is None:
        now = timezone.now()
    if not value:
        return _('never')
    if value < (now - timedelta(days=5)):
        return value.date()
    value = (' '.join(timesince(value, now).split(' ')[0:2])).strip(',')
    if value == _('0 minutes'):
        return _('just now')
    if value == _('1 day'):
        return _('yesterday')
    return value + _(' ago')
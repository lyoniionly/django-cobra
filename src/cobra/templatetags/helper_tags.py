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
import six
from templatetag_sugar.register import tag
from templatetag_sugar.parser import Name, Variable, Constant, Optional

from cobra.apps.accounts.utils import get_gravatar
from cobra.core.javascript import to_json
from cobra.core.loading import get_model, get_class, get_profile_class
from cobra.core.constants import EVENTS_PER_PAGE
from cobra.core.utils import multi_get_letter
from cobra.apps.accounts.utils import get_gravatar, get_default_avatar_url, get_user
from cobra.core.compat import get_user_model

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
def get_avatar_url(user, size=settings.COBRA_ACCOUNTS_AVATAR_DEFAULT_SIZE):
    if user is None:
        return get_default_avatar_url()
    Profile = get_profile_class()
    try:
        instance = Profile.objects.get(user=user)
    except Profile.DoesNotExist:
        # User has no profile, try a blank one
        instance = Profile(user=user)
    return instance.get_avatar_url(size)


@register.inclusion_tag('partials/_avatar_tag.html')
def get_avatar(user, size=settings.COBRA_ACCOUNTS_AVATAR_DEFAULT_SIZE, **kwargs):
    if not isinstance(user, get_user_model()):
        try:
            user = get_user(user)
            alt = six.text_type(user)
            url = get_avatar_url(user, size)
        except get_user_model().DoesNotExist:
            url = get_default_avatar_url()
            alt = _("Default Avatar")
    else:
        alt = six.text_type(user)
        url = get_avatar_url(user, size)
    context = dict(kwargs, **{
        'user': user,
        'url': url,
        'alt': alt,
        'size': size,
    })
    return context


@register.filter
def user_display_name(user):
    return user.get_full_name() or user.username


@register.inclusion_tag('partials/project_avatar.html')
def get_project_avatar(project, css_class=''):
    has_avatar = False
    cxt = {'project': project}
    if project.avatar:
        has_avatar = True
    else:
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
        cxt.update({'style': style, 'first_cap': first_cap.upper()})
    cxt.update({'has_avatar': has_avatar, 'css_class': css_class, })
    return cxt


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
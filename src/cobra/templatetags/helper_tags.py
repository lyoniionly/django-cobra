from __future__ import absolute_import

import six
from datetime import timedelta

from django import template
from django.conf import settings
from django.utils import timezone
from django.utils.translation import ugettext as _, get_language

from cobra.core.javascript import to_json
from cobra.core.loading import get_model, get_class
from cobra.core.utils import multi_get_letter, get_datetime_now
from cobra.apps.accounts.utils import get_default_avatar_url, get_user, get_avatar_url as get_avatar_url_util
from cobra.core.compat import get_user_model
from cobra.core.http import absolute_uri
from cobra.core import locale
from cobra.core.dates import epoch

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


@register.simple_tag
def get_avatar_url(user, size=settings.COBRA_ACCOUNTS_AVATAR_DEFAULT_SIZE):
    return get_avatar_url_util(user, size)


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


@register.filter
def absolute_url(url):
    return absolute_uri(url)


@register.assignment_tag
def moment_locale():
    locale_mapping = getattr(settings, 'MOMENT_LOCALES',
                             locale.LOCALE_MAPPING)
    return locale_mapping.get(get_language(), 'en')


@register.simple_tag
def now_epoch():
    return epoch(get_datetime_now(), msec=True)
import cobra
import re
import platform
import django
from django.utils.six.moves.urllib import parse
from django.conf import settings
from django.utils.safestring import mark_safe

from cobra.apps.accounts.utils import get_user_info_by_pk


def strip_language_code(request):
    """
    When using Django's i18n_patterns, we need a language-neutral variant of
    the current URL to be able to use set_language to change languages.
    This naive approach strips the language code from the beginning of the URL
    and will likely fail if using translated URLs.
    """
    path = request.path
    if settings.USE_I18N and hasattr(request, 'LANGUAGE_CODE'):
        return re.sub('^/%s/' % request.LANGUAGE_CODE, '/', path)
    return path


def usage_statistics_string():
    """
    For Cobra development, it is helpful to know which versions of Cobra,
    Django and Python are in use, and which can be safely deprecated or
    removed. If tracking is enabled, this function builds a query string with
    that information. It is used in dashboard/layout.html with an invisible
    tracker pixel.
    If you're developing locally or tracking is disabled, the tracker pixel
    does not get rendered and no information is collected.
    """
    if not settings.DEBUG and getattr(settings, 'COBRA_TRACKING', True):
        params = {
            'django': django.get_version(),
            'python': platform.python_version(),
            'cobra': cobra.get_version(),
        }
        return mark_safe(parse.urlencode(params))
    else:
        return None


def metadata(request):
    """
    Add some generally useful metadata to the template context
    """
    meta = {'display_version': getattr(settings, 'DISPLAY_VERSION', False),
            'version': getattr(settings, 'VERSION', 'N/A'),
            'system_name': settings.COBRA_SYSTEM_NAME,
            'system_tagline': settings.COBRA_SYSTEM_TAGLINE,
            'homepage_url': settings.COBRA_HOMEPAGE,
            'use_less': getattr(settings, 'USE_LESS', False),
            'json_data_root': settings.COBRA_JSON_DATA_ROOT,
            'can_register': settings.COBRA_CAN_REGISTER,
            'call_home': usage_statistics_string(),
            'language_neutral_url_path': strip_language_code(request),
            'google_analytics_id': getattr(settings,
                                           'GOOGLE_ANALYTICS_ID', None)}
    if request.user and request.user.pk > 0:
        meta.update({'currentUser': get_user_info_by_pk(request.user.pk)})

    return meta

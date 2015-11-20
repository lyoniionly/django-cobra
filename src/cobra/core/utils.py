from __future__ import absolute_import  # for logging import below
import logging
import random
import os
import datetime
from django.core.exceptions import ImproperlyConfigured

from django.core.urlresolvers import resolve, reverse
from django.contrib.staticfiles.finders import find
from django.http import Http404

from django.shortcuts import redirect, resolve_url
from django.utils import six
from django.utils.encoding import force_str
from django.utils.http import is_safe_url
from django.utils.timezone import get_current_timezone, is_naive, make_aware
from django.conf import settings
from django.template.defaultfilters import (date as date_filter,
                                            slugify as django_slugify)
from django.utils.translation import ugettext as _
from unidecode import unidecode

from cobra.core.compat import sha_constructor
from cobra.core.loading import import_string

def get_datetime_now():
    """
    Returns datetime object with current point in time.

    In Django 1.4+ it uses Django's django.utils.timezone.now() which returns
    an aware or naive datetime that represents the current point in time
    when ``USE_TZ`` in project's settings is True or False respectively.
    In older versions of Django it uses datetime.datetime.now().

    """
    try:
        from django.utils import timezone
        return timezone.now() # pragma: no cover
    except ImportError: # pragma: no cover
        return datetime.datetime.now()


def get_local_datetime_now():
    try:
        from django.utils import timezone
        return timezone.localtime(timezone.now())
    except ImportError:
        return datetime.datetime.now()


def date_from_string(year, year_format, month='', month_format='', day='', day_format='', delim='__'):
    """
    Helper: get a datetime.date object given a format string and a year,
    month, and day (only year is mandatory). Raise a 404 for an invalid date.
    """
    format = delim.join((year_format, month_format, day_format))
    datestr = delim.join((year, month, day))
    try:
        return datetime.datetime.strptime(force_str(datestr), format).date()
    except ValueError:
        raise Http404(_("Invalid date string '%(datestr)s' given format '%(format)s'") % {
            'datestr': datestr,
            'format': format,
        })


def default_slugifier(value):
    """
    Oscar's default slugifier function.
    Uses Django's slugify function, but first applies unidecode() to convert
    non-ASCII strings to ASCII equivalents where possible.
    """
    return django_slugify(value)


def slugify(value):
    """
    Slugify a string (even if it contains non-ASCII chars)
    """
    # Re-map some strings to avoid important characters being stripped.  Eg
    # remap 'c++' to 'cpp' otherwise it will become 'c'.
    for k, v in settings.OSCAR_SLUG_MAP.items():
        value = value.replace(k, v)

    # Allow an alternative slugify function to be specified
    # Recommended way to specify a function is as a string
    slugifier = getattr(settings, 'OSCAR_SLUG_FUNCTION', default_slugifier)
    if isinstance(slugifier, six.string_types):
        slugifier = import_string(slugifier)

    # Use unidecode to convert non-ASCII strings to ASCII equivalents where
    # possible.
    value = slugifier(unidecode(six.text_type(value)))

    # Remove stopwords
    for word in settings.OSCAR_SLUG_BLACKLIST:
        value = value.replace(word + '-', '')
        value = value.replace('-' + word, '')

    return value


def compose(*functions):
    """
    Compose functions

    This is useful for combining decorators.
    """
    def _composed(*args):
        for fn in functions:
            try:
                args = fn(*args)
            except TypeError:
                # args must be scalar so we don't try to expand it
                args = fn(args)
        return args
    return _composed


def format_datetime(dt, format=None):
    """
    Takes an instance of datetime, converts it to the current timezone and
    formats it as a string. Use this instead of
    django.core.templatefilters.date, which expects localtime.

    :param format: Common will be settings.DATETIME_FORMAT or
                   settings.DATE_FORMAT, or the resp. shorthands
                   ('DATETIME_FORMAT', 'DATE_FORMAT')
    """
    if is_naive(dt):
        localtime = make_aware(dt, get_current_timezone())
        logging.warning(
            "oscar.core.utils.format_datetime received native datetime")
    else:
        localtime = dt.astimezone(get_current_timezone())
    return date_filter(localtime, format)


def safe_referrer(request, default):
    """
    Takes the request and a default URL. Returns HTTP_REFERER if it's safe
    to use and set, and the default URL otherwise.

    The default URL can be a model with get_absolute_url defined, a urlname
    or a regular URL
    """
    referrer = request.META.get('HTTP_REFERER')
    if referrer and is_safe_url(referrer, request.get_host()):
        return referrer
    if default:
        # Try to resolve. Can take a model instance, Django URL name or URL.
        return resolve_url(default)
    else:
        # Allow passing in '' and None as default
        return default


def redirect_to_referrer(request, default):
    """
    Takes request.META and a default URL to redirect to.

    Returns a HttpResponseRedirect to HTTP_REFERER if it exists and is a safe
    URL; to the default URL otherwise.
    """
    return redirect(safe_referrer(request, default))


def get_default_currency():
    """
    For use as the default value for currency fields.  Use of this function
    prevents Django's core migration engine from interpreting a change to
    OSCAR_DEFAULT_CURRENCY as something it needs to generate a migration for.
    """
    return settings.OSCAR_DEFAULT_CURRENCY


_LOGIN_URL = None

def get_login_url(reset=False):
    global _LOGIN_URL

    if _LOGIN_URL is None or reset:
        # if LOGIN_URL resolves force login_required to it instead of our own
        # XXX: this must be done as late as possible to avoid idempotent requirements
        try:
            resolve(settings.LOGIN_URL)
        except Exception:
            _LOGIN_URL = settings.COBRA_LOGIN_URL
        else:
            _LOGIN_URL = settings.LOGIN_URL

        if _LOGIN_URL is None:
            _LOGIN_URL = reverse('account_login')
    return _LOGIN_URL


def generate_sha1(string, salt=None):
    """
    Generates a sha1 hash for supplied string. Doesn't need to be very secure
    because it's not used for password checking. We got Django for that.

    :param string:
        The string that needs to be encrypted.

    :param salt:
        Optionally define your own salt. If none is supplied, will use a random
        string of 5 characters.

    :return: Tuple containing the salt and hash.

    """
    if not isinstance(string, (str, unicode)):
        string = str(string)
    if isinstance(string, unicode):
        string = string.encode("utf-8")
    if not salt:
        salt = sha_constructor(str(random.random())).hexdigest()[:5]
    hash = sha_constructor(salt+string).hexdigest()

    return (salt, hash)


def multi_get_letter(str_input):
    if isinstance(str_input, unicode):
        unicode_str = str_input
    else:
        try:
            unicode_str = str_input.decode('utf8')
        except:
            try:
                unicode_str = str_input.decode('gbk')
            except:
                print 'unknown coding'
                return

    return_list = []
    for one_unicode in unicode_str:
        return_list.append(single_get_first(one_unicode))
    return return_list


def single_get_first(unicode1):
    str1 = unicode1.encode('gbk')
    try:
        ord(str1)
        return str1
    except:
        asc = ord(str1[0]) * 256 + ord(str1[1]) - 65536
        if asc >= -20319 and asc <= -20284:
            return 'a'
        if asc >= -20283 and asc <= -19776:
            return 'b'
        if asc >= -19775 and asc <= -19219:
            return 'c'
        if asc >= -19218 and asc <= -18711:
            return 'd'
        if asc >= -18710 and asc <= -18527:
            return 'e'
        if asc >= -18526 and asc <= -18240:
            return 'f'
        if asc >= -18239 and asc <= -17923:
            return 'g'
        if asc >= -17922 and asc <= -17418:
            return 'h'
        if asc >= -17417 and asc <= -16475:
            return 'j'
        if asc >= -16474 and asc <= -16213:
            return 'k'
        if asc >= -16212 and asc <= -15641:
            return 'l'
        if asc >= -15640 and asc <= -15166:
            return 'm'
        if asc >= -15165 and asc <= -14923:
            return 'n'
        if asc >= -14922 and asc <= -14915:
            return 'o'
        if asc >= -14914 and asc <= -14631:
            return 'p'
        if asc >= -14630 and asc <= -14150:
            return 'q'
        if asc >= -14149 and asc <= -14091:
            return 'r'
        if asc >= -14090 and asc <= -13119:
            return 's'
        if asc >= -13118 and asc <= -12839:
            return 't'
        if asc >= -12838 and asc <= -12557:
            return 'w'
        if asc >= -12556 and asc <= -11848:
            return 'x'
        if asc >= -11847 and asc <= -11056:
            return 'y'
        if asc >= -11055 and asc <= -10247:
            return 'z'
        return ''


class MissDefaultImage(object):

    """
    """

    def __init__(self, name=None):
        self.name = name if name else settings.COBRA_MISSING_IMAGE_URL
        media_file_path = os.path.join(settings.MEDIA_ROOT, self.name)
        # don't try to symlink if MEDIA_ROOT is not set (e.g. running tests)
        if settings.MEDIA_ROOT and not os.path.exists(media_file_path):
            self.symlink_missing_image(media_file_path)

    def symlink_missing_image(self, media_file_path):
        static_file_path = find('cobra/img/%s' % self.name)
        if static_file_path is not None:
            try:
                os.symlink(static_file_path, media_file_path)
            except OSError:
                raise ImproperlyConfigured((
                    "Please copy/symlink the "
                    "'missing image' image at %s into your MEDIA_ROOT at %s. "
                    "This exception was raised because Oscar was unable to "
                    "symlink it for you.") % (media_file_path,
                                              settings.MEDIA_ROOT))
            else:
                logging.info((
                    "Symlinked the 'missing image' image at %s into your "
                    "MEDIA_ROOT at %s") % (media_file_path,
                                           settings.MEDIA_ROOT))



from __future__ import absolute_import, print_function
import urllib
from django.conf import settings

from cobra.core.compat import md5_constructor

try:
    from django.contrib.auth import get_user_model
except ImportError:
    from django.contrib.auth.models import User

    def get_user_model():
        return User

    custom_user_model = False
else:
    custom_user_model = True

def normalise_email(email):
    """
    The local part of an email address is case-sensitive, the domain part
    isn't.  This function lowercases the host and should be used in all email
    handling.
    """
    clean_email = email.strip()
    if '@' in clean_email:
        local, host = clean_email.split('@')
        return local + '@' + host.lower()
    return clean_email

def get_user(username):
    """ Return user from a username/ish identifier """
    if custom_user_model:
        return get_user_model().objects.get_by_natural_key(username)
    else:
        return get_user_model().objects.get(username=username)

def get_default_avatar_url():
    base_url = getattr(settings, 'STATIC_URL', None)
    if not base_url:
        base_url = getattr(settings, 'MEDIA_URL', '')

    # Don't use base_url if the default url starts with http:// of https://
    if settings.COBRA_ACCOUNTS_AVATAR_DEFAULT.startswith(('http://', 'https://')):
        return settings.COBRA_ACCOUNTS_AVATAR_DEFAULT
    # We'll be nice and make sure there are no duplicated forward slashes
    ends = base_url.endswith('/')

    begins = settings.COBRA_ACCOUNTS_AVATAR_DEFAULT.startswith('/')
    if ends and begins:
        base_url = base_url[:-1]
    elif not ends and not begins:
        return '%s/%s' % (base_url, settings.COBRA_ACCOUNTS_AVATAR_DEFAULT)

    return '%s%s' % (base_url, settings.COBRA_ACCOUNTS_AVATAR_DEFAULT)


def get_gravatar(email, size=80, default='identicon'):
    """ Get's a Gravatar for a email address.

    :param size:
        The size in pixels of one side of the Gravatar's square image.
        Optional, if not supplied will default to ``80``.

    :param default:
        Defines what should be displayed if no image is found for this user.
        Optional argument which defaults to ``identicon``. The argument can be
        a URI to an image or one of the following options:

            ``404``
                Do not load any image if none is associated with the email
                hash, instead return an HTTP 404 (File Not Found) response.

            ``mm``
                Mystery-man, a simple, cartoon-style silhouetted outline of a
                person (does not vary by email hash).

            ``identicon``
                A geometric pattern based on an email hash.

            ``monsterid``
                A generated 'monster' with different colors, faces, etc.

            ``wavatar``
                Generated faces with differing features and backgrounds

    :return: The URI pointing to the Gravatar.

    """
    if settings.COBRA_ACCOUNTS_AVATAR_GRAVATAR_SECURE:
        base_url = 'https://secure.gravatar.com/avatar/'
    else: base_url = '//www.gravatar.com/avatar/'

    gravatar_url = '%(base_url)s%(gravatar_id)s?' % \
            {'base_url': base_url,
             'gravatar_id': md5_constructor(email.lower()).hexdigest()}

    gravatar_url += urllib.urlencode({'s': str(size),
                                      'd': default})
    return gravatar_url
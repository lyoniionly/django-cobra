from __future__ import absolute_import

import six
import urllib

from collections import namedtuple
from django.conf import settings
from django.utils.safestring import mark_safe

from urlparse import urlparse, urljoin

ParsedUriMatch = namedtuple('ParsedUriMatch', ['scheme', 'domain', 'path'])


def absolute_uri(url=None):
    if not url:
        return settings.COBRA_URL_PREFIX
    return urljoin(settings.COBRA_URL_PREFIX.rstrip('/') + '/', url.lstrip('/'))


def safe_urlencode(params, doseq=0):
    """
    UTF-8-safe version of safe_urlencode

    The stdlib safe_urlencode prior to Python 3.x chokes on UTF-8 values
    which can't fail down to ascii.
    """
    # Snippet originally from pysolr: https://github.com/toastdriven/pysolr

    if hasattr(params, "items"):
        params = params.items()

    new_params = list()

    for k, v in params:
        k = k.encode("utf-8")

        if isinstance(v, six.string_types):
            new_params.append((k, v.encode("utf-8")))
        elif isinstance(v, (list, tuple)):
            new_params.append((k, [i.encode("utf-8") for i in v]))
        else:
            new_params.append((k, six.text_type(v)))

    return urllib.urlencode(new_params, doseq)


def is_same_domain(url1, url2):
    """
    Returns true if the two urls should be treated as if they're from the same
    domain (trusted).
    """
    url1 = urlparse(url1)
    url2 = urlparse(url2)
    return url1.netloc == url2.netloc


def get_origins(project=None):
    if settings.COBRA_ALLOW_ORIGIN == '*':
        return frozenset(['*'])

    if settings.COBRA_ALLOW_ORIGIN:
        result = settings.COBRA_ALLOW_ORIGIN.split(' ')
    else:
        result = []

    if project:
        # TODO: we should cache this
        from cobra.plugins.helpers import get_option
        optval = get_option('cobra:origins', project)
        if optval:
            result.extend(optval)

    # lowercase and strip the trailing slash from all origin values
    # filter out empty values
    return frozenset(filter(bool, map(lambda x: x.lower().rstrip('/'), result)))


def parse_uri_match(value):
    if '://' in value:
        scheme, value = value.split('://', 1)
    else:
        scheme = '*'

    if '/' in value:
        domain, path = value.split('/', 1)
    else:
        domain, path = value, '*'

    return ParsedUriMatch(scheme, domain, path)


def is_valid_origin(origin, project=None):
    """
    Given an ``origin`` which matches a base URI (e.g. http://example.com)
    determine if a valid origin is present in the project settings.

    Origins may be defined in several ways:

    - http://domain.com[:port]: exact match for base URI (must include port)
    - *: allow any domain
    - *.domain.com: matches domain.com and all subdomains, on any port
    - domain.com: matches domain.com on any port
    """
    allowed = get_origins(project)
    if '*' in allowed:
        return True

    if not origin:
        return False

    # we always run a case insensitive check
    origin = origin.lower()

    # Fast check
    if origin in allowed:
        return True

    # XXX: In some cases origin might be localhost (or something similar) which causes a string value
    # of 'null' to be sent as the origin
    if origin == 'null':
        return False

    parsed = urlparse(origin)

    # There is no hostname, so the header is probably invalid
    if parsed.hostname is None:
        return False

    for value in allowed:
        bits = parse_uri_match(value)

        # scheme supports exact and any match
        if bits.scheme not in ('*', parsed.scheme):
            continue

        # domain supports exact, any, and prefix match
        if bits.domain[:2] == '*.':
            if parsed.hostname.endswith(bits.domain[1:]) or parsed.hostname == bits.domain[2:]:
                return True
            continue
        elif bits.domain not in ('*', parsed.hostname, parsed.netloc):
            continue

        # path supports exact, any, and suffix match (with or without *)
        path = bits.path
        if path == '*':
            return True
        if path.endswith('*'):
            path = path[:-1]
        if parsed.path.startswith(path):
            return True
    return False


def generate_hyperlink(name, url='', safe=True, **options):
    if url:
        abs_url = absolute_uri(url)
        css_class = options.pop('class', None)
        target = options.pop('target', None)
        hyperlink_template = '<a href="%(url)s"'
        if css_class:
            hyperlink_template += ' class="%(class)s"'
        if target:
            hyperlink_template += ' target="%(target)s"'
        hyperlink_template += '>%(name)s</a>'
        hyperlink = hyperlink_template % {'url': abs_url, 'class': css_class, 'target': target, 'name': name}
        if safe:
            return mark_safe(hyperlink)
        else:
            return hyperlink
    else:
        return name
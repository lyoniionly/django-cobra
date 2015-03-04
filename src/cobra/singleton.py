from __future__ import absolute_import

from django.conf import settings
from threading import local
from cobra.core.loading import import_string


class State(local):
    request = None
    data = {}

env = State()


def get_instance(path, options):
    cls = import_string(path)
    return cls(**options)


# TODO(dcramer): this is getting heavy, we should find a better way to structure this
cache = get_instance(settings.COBRA_CACHE, settings.COBRA_CACHE_OPTIONS)
nodestore = get_instance(settings.COBRA_NODESTORE, settings.COBRA_NODESTORE_OPTIONS)
ratelimiter = get_instance(settings.COBRA_RATELIMITER, settings.COBRA_RATELIMITER_OPTIONS)
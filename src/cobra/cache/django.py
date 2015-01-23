from __future__ import absolute_import

from django.core.cache import cache
from threading import local


class DjangoCache(local):
    def set(self, key, value, timeout):
        cache.set(key, value, timeout)

    def delete(self, key):
        cache.delete(key)

    def get(self, key):
        return cache.get(key)

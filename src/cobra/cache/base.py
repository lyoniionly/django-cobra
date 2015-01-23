from __future__ import absolute_import

from threading import local


class BaseCache(local):
    def set(self, key, value, timeout):
        raise NotImplementedError

    def delete(self, key):
        raise NotImplementedError

    def get(self, key):
        raise NotImplementedError

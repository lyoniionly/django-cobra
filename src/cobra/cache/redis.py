from __future__ import absolute_import

from django.conf import settings
from nydus.db import create_cluster
from threading import local

from cobra.core import json


class RedisCache(local):
    key_expire = 60 * 60  # 1 hour

    def __init__(self, **options):
        if not options:
            # inherit default options from REDIS_OPTIONS
            options = settings.COBRA_REDIS_OPTIONS

        options.setdefault('hosts', {
            0: {},
        })
        options.setdefault('router', 'nydus.db.routers.keyvalue.PartitionRouter')
        self.conn = create_cluster({
            'engine': 'nydus.db.backends.redis.Redis',
            'router': options['router'],
            'hosts': options['hosts'],
        })

    def set(self, key, value, timeout):
        with self.conn.map() as conn:
            conn.set(key, json.dumps(value))
            if timeout:
                conn.expire(key, timeout)

    def delete(self, key):
        self.conn.delete(key)

    def get(self, key):
        result = self.conn.get(key)
        if result is not None:
            result = json.loads(result)
        return result

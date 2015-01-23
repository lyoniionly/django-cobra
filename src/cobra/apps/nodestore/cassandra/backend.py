
from __future__ import absolute_import, print_function

import casscache

from cobra.apps.nodestore.base import NodeStorage


class CassandraNodeStorage(NodeStorage):
    """
    A Cassandra-based backend for storing node data.

    >>> CassandraNodeStorage(
    ...     servers=['127.0.0.1:9042'],
    ...     keyspace='cobra',
    ...     columnfamily='nodestore',
    ... )
    """
    def __init__(self, servers, keyspace='cobra',
                 columnfamily='nodestore', **kwargs):
        self.conn = casscache.Client(
            servers=servers,
            keyspace=keyspace,
            columnfamily=columnfamily,
            **kwargs
        )
        super(CassandraNodeStorage, self).__init__(**kwargs)

    def delete(self, id):
        self.conn.delete(id)

    def get(self, id):
        return self.conn.get(id)

    def get_multi(self, id_list):
        return self.conn.get_multi(id_list)

    def set(self, id, data):
        self.conn.set(id, data)

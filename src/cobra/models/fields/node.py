from __future__ import absolute_import, print_function

import collections
import logging
import six
import warnings

from django.db import models
from django.db.models.signals import post_delete

from cobra.core.cache import memoize
from cobra.core.compat import pickle
from cobra.core.strings import decompress, compress

from .gzippeddict import GzippedDictField

try:
    from south.modelsinspector import add_introspection_rules
except ImportError:
    pass
else:
    add_introspection_rules([], ["^cobra\.models\.fields\.node\.NodeField"])

__all__ = ('NodeField',)

logger = logging.getLogger('cobra.errors')


class NodeData(collections.MutableMapping):
    def __init__(self, id, data=None):
        self.id = id
        self._node_data = data

    def __getitem__(self, key):
        return self.data[key]

    def __setitem__(self, key, value):
        self.data[key] = value

    def __delitem__(self, key):
        del self.data[key]

    def __iter__(self):
        return iter(self.data)

    def __len__(self):
        return len(self.data)

    def __repr__(self):
        cls_name = type(self).__name__
        if self._node_data:
            return '<%s: id=%s data=%r>' % (
                cls_name, self.id, repr(self._node_data))
        return '<%s: id=%s>' % (cls_name, self.id,)

    @memoize
    def data(self):
        from cobra import singleton

        if self._node_data is not None:
            return self._node_data

        elif self.id:
            warnings.warn('You should populate node data before accessing it.')
            return singleton.nodestore.get(self.id) or {}

        return {}

    def bind_data(self, data):
        self._node_data = data


class NodeField(GzippedDictField):
    """
    Similar to the gzippedictfield except that it stores a reference
    to an external node.
    """
    def contribute_to_class(self, cls, name):
        super(NodeField, self).contribute_to_class(cls, name)
        post_delete.connect(
            self.on_delete,
            sender=self.model,
            weak=False)

    def on_delete(self, instance, **kwargs):
        from cobra import singleton

        value = getattr(instance, self.name)
        if not value.id:
            return

        singleton.nodestore.delete(value.id)

    def to_python(self, value):
        if isinstance(value, six.string_types) and value:
            try:
                value = pickle.loads(decompress(value))
            except Exception as e:
                logger.exception(e)
                value = {}
        elif not value:
            value = {}

        if 'node_id' in value:
            node_id = value.pop('node_id')
            data = None
        else:
            node_id = None
            data = value

        return NodeData(node_id, data)

    def get_prep_value(self, value):
        from cobra import singleton

        if not value and self.null:
            # save ourselves some storage
            return None

        # TODO(dcramer): we should probably do this more intelligently
        # and manually
        if not value.id:
            value.id = singleton.nodestore.create(value.data)
        else:
            singleton.nodestore.set(value.id, value.data)

        return compress(pickle.dumps({
            'node_id': value.id
        }))
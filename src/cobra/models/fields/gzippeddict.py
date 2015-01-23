from __future__ import absolute_import, print_function

import logging
import six

from django.db import models
from cobra.core.compat import pickle
from cobra.core.strings import decompress, compress

try:
    from south.modelsinspector import add_introspection_rules
except ImportError:
    pass
else:
    add_introspection_rules([], ["^cobra\.models\.fields\.gzippeddict\.GzippedDictField"])

__all__ = ('GzippedDictField',)

logger = logging.getLogger('cobra.errors')


class GzippedDictField(models.TextField):
    """
    Slightly different from a JSONField in the sense that the default
    value is a dictionary.
    """
    __metaclass__ = models.SubfieldBase

    def to_python(self, value):
        if isinstance(value, six.string_types) and value:
            try:
                value = pickle.loads(decompress(value))
            except Exception as e:
                logger.exception(e)
                return {}
        elif not value:
            return {}
        return value

    def get_prep_value(self, value):
        if not value and self.null:
            # save ourselves some storage
            return None
        # enforce unicode strings to guarantee consistency
        if isinstance(value, str):
            value = six.text_type(value)
        return compress(pickle.dumps(value))

    def value_to_string(self, obj):
        value = self._get_val_from_obj(obj)
        return self.get_prep_value(value)
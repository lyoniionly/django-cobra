from __future__ import absolute_import

from django.conf import settings
from django.db import models
from django.utils.translation import ugettext_lazy as _

try:
    from south.modelsinspector import add_introspection_rules
except ImportError:
    pass
else:
    add_introspection_rules([], ["^cobra\.models\.fields\.bounded\.BoundedAutoField"])
    add_introspection_rules([], ["^cobra\.models\.fields\.bounded\.BoundedBigAutoField"])
    add_introspection_rules([], ["^cobra\.models\.fields\.bounded\.BoundedIntegerField"])
    add_introspection_rules([], ["^cobra\.models\.fields\.bounded\.BoundedBigIntegerField"])
    add_introspection_rules([], ["^cobra\.models\.fields\.bounded\.BoundedPositiveIntegerField"])
    add_introspection_rules([], ["^cobra\.models\.fields\.pickle\.UnicodePickledObjectField"])

__all__ = (
    'BoundedAutoField', 'BoundedBigAutoField', 'BoundedIntegerField',
    'BoundedBigIntegerField', 'BoundedPositiveIntegerField'
)


class BoundedIntegerField(models.IntegerField):
    MAX_VALUE = 2147483647

    def get_prep_value(self, value):
        if value:
            value = int(value)
            assert value <= self.MAX_VALUE
        return super(BoundedIntegerField, self).get_prep_value(value)


class BoundedPositiveIntegerField(models.PositiveIntegerField):
    MAX_VALUE = 2147483647

    def get_prep_value(self, value):
        if value:
            value = int(value)
            assert value <= self.MAX_VALUE
        return super(BoundedPositiveIntegerField, self).get_prep_value(value)


class BoundedAutoField(models.AutoField):
    MAX_VALUE = 2147483647

    def get_prep_value(self, value):
        if value:
            value = int(value)
            assert value <= self.MAX_VALUE
        return super(BoundedAutoField, self).get_prep_value(value)


if settings.COBRA_USE_BIG_INTS:
    class BoundedBigIntegerField(models.BigIntegerField):
        description = _("Big Integer")

        MAX_VALUE = 9223372036854775807

        def get_internal_type(self):
            return "BigIntegerField"

        def get_prep_value(self, value):
            if value:
                value = long(value)
                assert value <= self.MAX_VALUE
            return super(BoundedBigIntegerField, self).get_prep_value(value)

    class BoundedBigAutoField(models.AutoField):
        description = _("Big Integer")

        MAX_VALUE = 9223372036854775807

        def db_type(self, connection):
            engine = connection.settings_dict['ENGINE']
            if 'mysql' in engine:
                return "bigint AUTO_INCREMENT"
            elif 'oracle' in engine:
                return "NUMBER(19)"
            elif 'postgres' in engine:
                return "bigserial"
            # SQLite doesnt actually support bigints with auto incr
            elif 'sqlite' in engine:
                return 'integer'
            else:
                raise NotImplemented

        def get_related_db_type(self, connection):
            return BoundedBigIntegerField().db_type(connection)

        def get_internal_type(self):
            return "BigIntegerField"

        def get_prep_value(self, value):
            if value:
                value = long(value)
                assert value <= self.MAX_VALUE
            return super(BoundedBigAutoField, self).get_prep_value(value)

else:
    # we want full on classes for these
    class BoundedBigIntegerField(BoundedIntegerField):
        pass

    class BoundedBigAutoField(BoundedAutoField):
        pass

from __future__ import absolute_import, print_function

from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils import timezone

from cobra.models import Model
from cobra.models import fields
from cobra.models import sane_repr


@python_2_unicode_compatible
class AbstractOption(Model):
    """
    Global options which apply in most situations as defaults,
    and generally can be overwritten by per-project options.

    Options which are specific to a plugin should namespace
    their key. e.g. key='myplugin:optname'
    """
    key = models.CharField(max_length=64, unique=True)
    value = fields.UnicodePickledObjectField()
    last_updated = models.DateTimeField(default=timezone.now)

    class Meta:
        abstract = True
        app_label = 'option'
        db_table = 'cobra_option'

    __repr__ = sane_repr('key', 'value')

    def __str__(self):
        return self.key
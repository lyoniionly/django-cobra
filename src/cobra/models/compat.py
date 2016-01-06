import django
from django.db import models
from django.utils import six

if django.VERSION >= (1, 8):
    _GzippedDictField = models.TextField
else:
    _GzippedDictField = six.with_metaclass(models.SubfieldBase, models.TextField)
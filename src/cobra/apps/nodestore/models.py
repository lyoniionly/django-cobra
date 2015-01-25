from __future__ import absolute_import

from django.db import models
from django.utils import timezone
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ungettext, ugettext_lazy as _

from cobra.models import (
    BaseModel, GzippedDictField, sane_repr)


@python_2_unicode_compatible
class Node(BaseModel):
    """
    Whatever you use cassandra or riak or both, this model is always to be build
    """
    id = models.CharField(max_length=40, primary_key=True)
    data = GzippedDictField()
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    __repr__ = sane_repr('timestamp')

    class Meta:
        app_label = 'nodestore'
        verbose_name = _("Node store")
        verbose_name_plural = _("Node store")

    def __str__(self):
        return self.id
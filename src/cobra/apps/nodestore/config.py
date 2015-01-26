from __future__ import absolute_import

from django.apps import AppConfig
from django.utils.translation import ugettext_lazy as _


class NodeStoreConfig(AppConfig):
    label = 'nodestore'
    name = 'cobra.apps.nodestore'
    verbose_name = _('NodeStore')

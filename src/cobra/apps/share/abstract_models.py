# coding=utf-8

from __future__ import absolute_import, print_function
from datetime import datetime
from django.conf import settings
from django.contrib.contenttypes.models import ContentType

from django.db import models
from django.utils.dateparse import parse_datetime
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _
from django.utils.translation import ugettext
from django.utils import timezone
from cobra.apps.accounts.utils import get_user_info

from cobra.core.compat import AUTH_USER_MODEL
from cobra.models import Model
from cobra.models import fields
from cobra.models import sane_repr
from cobra.core.loading import get_model
from cobra.core.dates import epoch
from cobra.core.compat import generic


class AbstractShare(Model):
    """
    """
    content_type = models.ForeignKey(ContentType, blank=True, null=True,
                                            related_name='target', db_index=True)
    object_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
    content_object = generic.GenericForeignKey('content_type', 'object_id')

    share_type = models.CharField(_('Share Type'), max_length=100, null=True, blank=True)
    entry_type = models.CharField(_('Entry Type'), max_length=100, null=True, blank=True)
    module = models.CharField(_('Module'), max_length=100, null=True, blank=True)

    class Meta:
        abstract = True


@python_2_unicode_compatible
class AbstractUserShare(AbstractShare):
    """
    """
    user = fields.FlexibleForeignKey(AUTH_USER_MODEL)

    class Meta:
        abstract = True
        app_label = 'share'
        db_table = 'cobra_user_share'

    __repr__ = sane_repr('object_id', 'user_id')

    def __str__(self):
        return '%s share' % self.user

    def to_dict(self):
        data = {
            'mask': 1,
            'granting': True,
            'entryType': self.entry_type,
            'module': self.module,
            'shareType': self.share_type,
            'name': self.user.get_full_name() or self.user.username,
            'typeCount': 0,
            'id': self.pk,
            'entityId': self.object_id,
            'sid': self.user.pk,
            'shareEmp': get_user_info(self.user)
        }
        return data
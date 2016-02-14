# coding=utf-8

from __future__ import absolute_import, print_function
from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _

from cobra.core.compat import AUTH_USER_MODEL
from cobra.models import Model
from cobra.models import fields
from cobra.models import sane_repr


@python_2_unicode_compatible
class AbstractMenu(Model):
    """
    """
    name = models.CharField(_('Menu name'), max_length=255)
    order = models.IntegerField(_('Menu order'))
    is_used = models.BooleanField(_('Menu status'), default=False)

    class Meta:
        abstract = True
        app_label = 'menu'
        db_table = 'cobra_menu'
        ordering = ['order']

    __repr__ = sane_repr('name',)

    def __str__(self):
        return '%s - %d' % (self.name, self.order)

    def to_dict(self):
        data = {
            'id': self.pk,
            'menuName': self.name,
            'menuStatus': 1 if self.is_used else 0,
            'orderIndex': self.order
        }
        return data


@python_2_unicode_compatible
class AbstractUserMenu(Model):
    """
    """
    menu = fields.FlexibleForeignKey('menu.Menu')
    user = fields.FlexibleForeignKey(AUTH_USER_MODEL)
    order = models.IntegerField(_('Order'))
    is_used = models.BooleanField(_('Status'), default=False)

    class Meta:
        abstract = True
        app_label = 'menu'
        db_table = 'cobra_user_menu'

    __repr__ = sane_repr('menu_id', 'user_id')

    def __str__(self):
        return '%s (%s)' % (self.user, self.menu.name)

    def to_dict(self):
        data = {
            'id': self.menu.pk,
            'empid': self.user.pk,
            'menuName': self.menu.name,
            'menuStatus': 1 if self.is_used else 0,
            'orderIndex': self.order
        }
        return data
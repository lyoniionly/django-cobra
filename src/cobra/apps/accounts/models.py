# -*- coding: utf-8 -*-
from __future__ import absolute_import
import django
from cobra.core.loading import is_model_registered

from .abstract_models import *  # noqa

__all__ = []


if not is_model_registered('accounts', 'User'):
    class User(AbstractUser):
        """
        Copy from django auth User.
        If not custom the User model in site, will use this model default.

        Username, password and email are required. Other fields are optional.
        """
        class Meta(AbstractUser.Meta):
            swappable = 'AUTH_USER_MODEL'

    __all__.append('User')


if django.VERSION < (1, 7):
    from .receivers import *  # noqa


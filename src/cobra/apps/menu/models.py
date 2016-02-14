# -*- coding: utf-8 -*-
from cobra.core.loading import is_model_registered

from .abstract_models import *  # noqa

__all__ = []


if not is_model_registered('menu', 'Menu'):
    class Menu(AbstractMenu):
        pass

    __all__.append('Menu')


if not is_model_registered('menu', 'UserMenu'):
    class UserMenu(AbstractUserMenu):
        pass

    __all__.append('UserMenu')

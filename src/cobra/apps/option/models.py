# -*- coding: utf-8 -*-
from cobra.core.loading import is_model_registered

from .abstract_models import *  # noqa

__all__ = []


if not is_model_registered('option', 'Option'):
    class Option(AbstractOption):
        pass

    __all__.append('Option')


if not is_model_registered('option', 'UserOption'):
    class UserOption(AbstractUserOption):
        pass

    __all__.append('UserOption')


if not is_model_registered('option', 'ProjectOption'):
    class ProjectOption(AbstractProjectOption):
        pass

    __all__.append('ProjectOption')
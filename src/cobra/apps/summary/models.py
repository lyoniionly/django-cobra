# -*- coding: utf-8 -*-
from cobra.core.loading import is_model_registered

from .abstract_models import *  # noqa

__all__ = []


if not is_model_registered('summary', 'WorkReport'):
    class WorkReport(AbstractWorkReport):
        pass

    __all__.append('WorkReport')


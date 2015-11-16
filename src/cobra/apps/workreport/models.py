# -*- coding: utf-8 -*-
from cobra.core.loading import is_model_registered

from .abstract_models import *  # noqa

__all__ = []


if not is_model_registered('workreport', 'DailyReport'):
    class DailyReport(AbstractDailyReport):
        pass

    __all__.append('DailyReport')


if not is_model_registered('workreport', 'DailyFinishedTask'):
    class DailyFinishedTask(AbstractDailyFinishedTask):
        pass

    __all__.append('DailyFinishedTask')


if not is_model_registered('workreport', 'DailyDeadline'):
    class DailyDeadline(AbstractDailyDeadline):
        pass

    __all__.append('DailyDeadline')


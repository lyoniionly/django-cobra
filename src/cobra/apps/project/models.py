# -*- coding: utf-8 -*-
import django
from cobra.core.loading import is_model_registered

from .abstract_models import *  # noqa

__all__ = []


if not is_model_registered('project', 'Project'):
    class Project(AbstractProject):
        pass

    __all__.append('Project')


if not is_model_registered('project', 'ProjectKey'):
    class ProjectKey(AbstractProjectKey):
        pass

    __all__.append('ProjectKey')


if django.VERSION < (1, 7):
    from .receivers import *  # noqa
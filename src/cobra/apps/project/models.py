# -*- coding: utf-8 -*-
from cobra.core.loading import is_model_registered

from .abstract_models import *  # noqa

__all__ = []


if not is_model_registered('project', 'Project'):
    class Team(AbstractProject):
        pass

    __all__.append('Project')


if not is_model_registered('project', 'ProjectOption'):
    class TeamMember(AbstractProjectOption):
        pass

    __all__.append('ProjectOption')


if not is_model_registered('project', 'ProjectKey'):
    class ProjectKey(AbstractProjectKey):
        pass

    __all__.append('ProjectKey')

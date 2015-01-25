# -*- coding: utf-8 -*-
from cobra.core.loading import is_model_registered

from .abstract_models import *  # noqa

__all__ = []


if not is_model_registered('team', 'Team'):
    class Team(AbstractTeam):
        pass

    __all__.append('Team')


if not is_model_registered('team', 'TeamMember'):
    class TeamMember(AbstractTeamMember):
        pass

    __all__.append('TeamMember')


if not is_model_registered('team', 'PendingTeamMember'):
    class PendingTeamMember(AbstractPendingTeamMember):
        pass

    __all__.append('PendingTeamMember')

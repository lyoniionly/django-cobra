from __future__ import absolute_import

import logging

from cobra.core.loading import get_model
from cobra.models import BaseManager
from .utils import ProjectStatus


class ProjectManager(BaseManager):
    # TODO(dcramer): we might want to cache this per user
    def get_for_user(self, team, user, access=None, _skip_team_check=False):
        Team = get_model('team', 'Team')

        if not (user and user.is_authenticated()):
            return []

        if not _skip_team_check:
            team_list = Team.objects.get_for_user(
                organization=team.organization,
                user=user,
                access=access,
            )

            try:
                team = team_list[team_list.index(team)]
            except ValueError:
                logging.info('User does not have access to team: %s', team.id)
                return []

        # Identify access groups
        if getattr(team, 'is_access_group', False):
            logging.warning('Team is using deprecated access groups: %s', team.id)
            # base_qs = Project.objects.filter(
            base_qs = self.filter(
                accessgroup__team=team,
                accessgroup__members=user,
                status=ProjectStatus.VISIBLE,
            )
        else:
            base_qs = self.filter(
                team=team,
                status=ProjectStatus.VISIBLE,
            )

        project_list = []
        for project in base_qs:
            project.team = team
            project_list.append(project)

        return sorted(project_list, key=lambda x: x.name.lower())
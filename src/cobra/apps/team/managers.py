from __future__ import absolute_import

from django.conf import settings

from cobra.models import BaseManager
from cobra.core.loading import get_model, get_class
from .utils import TeamStatus


class TeamManager(BaseManager):
    def get_for_user(self, organization, user, access=None, access_groups=True,
                     with_projects=False):
        """
        Returns a list of all teams a user has some level of access to.

        Each <Team> returned has an ``access_type`` attribute which holds the
        OrganizationMemberType value.
        """
        AccessGroup = get_model('accessgroup', 'AccessGroup')
        OrganizationMember = get_model('organization', 'OrganizationMember')
        Project = get_model('project','Project')
        OrganizationMemberType = get_class('organization.utils','OrganizationMemberType')

        if not user.is_authenticated():
            return []

        base_team_qs = self.filter(
            organization=organization,
            status=TeamStatus.VISIBLE
        )

        if user.is_superuser:
            team_list = list(base_team_qs)
            for team in team_list:
                team.access_type = OrganizationMemberType.OWNER

        elif settings.COBRA_PUBLIC and access is None:
            team_list = list(base_team_qs)
            for team in team_list:
                team.access_type = OrganizationMemberType.MEMBER

        else:
            om_qs = OrganizationMember.objects.filter(
                user=user,
                organization=organization,
            )
            if access is not None:
                om_qs = om_qs.filter(type__lte=access)

            try:
                om = om_qs.get()
            except OrganizationMember.DoesNotExist:
                team_qs = self.none()
            else:
                if om.has_global_access:
                    team_qs = base_team_qs
                else:
                    team_qs = om.teams.filter(
                        status=TeamStatus.VISIBLE
                    )

                for team in team_qs:
                    team.access_type = om.type

            team_list = set(team_qs)

            # TODO(dcramer): remove all of this junk when access groups are
            # killed
            ag_qs = AccessGroup.objects.filter(
                members=user,
                team__organization=organization,
                team__status=TeamStatus.VISIBLE,
            ).select_related('team')
            if access is not None:
                ag_qs = ag_qs.filter(type__lte=access)

            for ag in ag_qs:
                if ag.team in team_list:
                    continue

                ag.team.is_access_group = True
                ag.team.access_type = ag.type
                team_list.add(ag.team)

        results = sorted(team_list, key=lambda x: x.name.lower())

        if with_projects:
            # these kinds of queries make people sad :(
            for idx, team in enumerate(results):
                project_list = list(Project.objects.get_for_user(
                    team=team,
                    user=user,
                    _skip_team_check=True
                ))
                results[idx] = (team, project_list)

        return results
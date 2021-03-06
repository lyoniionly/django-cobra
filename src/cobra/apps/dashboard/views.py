from __future__ import absolute_import, print_function

from django.views.generic import TemplateView
from cobra.core.loading import get_model
from cobra.views.mixins import PageTitleMixin

Organization = get_model('organization', 'Organization')
Team = get_model('team', 'Team')
Project = get_model('project', 'Project')
AuditLogEntry = get_model('auditlog', 'AuditLogEntry')


class IndexView(PageTitleMixin, TemplateView):
    """
    """

    template_name = 'dashboard/index.html'
    active_tab = 'activity'

    def get_context_data(self, **kwargs):
        ctx = super(IndexView, self).get_context_data(**kwargs)
        ctx.update(self.get_stats())
        return ctx

    def get_stats(self):
        orgs = self.get_organizations()
        teams = self.get_teams(orgs)
        projects = self.get_projects(teams)
        activities = self.get_activities(orgs)
        return {
            'projects': projects,
            'projects_count': len(projects),
            'organizations': orgs,
            'organizations_count': len(orgs),
            'teams': teams,
            'teams_count': len(teams),
            'activities': activities
        }



    def get_organizations(self):
        return Organization.objects.get_for_user(self.request.user)

    def get_teams(self, orgs):
        team_list = []
        for org in orgs:
            team_list.extend(Team.objects.get_for_user(
                organization=org,
                user=self.request.user,
            ))
        return team_list

    def get_projects(self, teams):
        project_list = []
        for team in teams:
            project_list.extend(Project.objects.get_for_user(
                team=team,
                user=self.request.user,
            ))
        project_list.sort(key=lambda x: x.name)
        return project_list

    def get_activities(self, orgs):
        acts = AuditLogEntry.objects.filter(organization__in=orgs)
        return acts
from __future__ import absolute_import
from cobra.core.loading import get_model, get_class
from django.utils.translation import ugettext_lazy as _
from django.views import generic


Organization = get_model('organization', 'Organization')
Team = get_model('team', 'Team')
Project = get_model('project', 'Project')
AuditLogEntry = get_model('auditlog', 'AuditLogEntry')


class ListView(generic.ListView):
    model = AuditLogEntry
    template_name = 'dashboard/index.html'
    context_object_name = 'activities'
    paginate_by = 2

    def get_context_data(self, **kwargs):
        context = super(ListView, self).get_context_data(**kwargs)
        context.update(self.stats)
        return context

    def get_queryset(self):
        self.stats = self.get_stats()
        return self.activities

    def get_stats(self):
        self.orgs = orgs =self.get_organizations()
        self.teams = teams = self.get_teams(orgs)
        self.projects = projects = self.get_projects(teams)
        self.activities = activities = self.get_activities(orgs)
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
from __future__ import absolute_import, print_function

from django.views.generic import TemplateView
from cobra.core.loading import get_model
from cobra.views.mixins import PageTitleMixin

Organization = get_model('organization', 'Organization')
Team = get_model('team', 'Team')
Project = get_model('project', 'Project')


class IndexView(PageTitleMixin, TemplateView):
    """
    """

    template_name = 'dashboard/index.html'
    active_tab = 'activity'

    def get_context_data(self, **kwargs):
        ctx = super(IndexView, self).get_context_data(**kwargs)
        ctx.update(self.get_projects())
        return ctx

    def get_projects(self):
        org_list = Organization.objects.get_for_user(self.request.user)
        team_list = []
        for org in org_list:
            team_list.extend(Team.objects.get_for_user(
                organization=org,
                user=self.request.user,
            ))

        project_list = []
        for team in team_list:
            project_list.extend(Project.objects.get_for_user(
                team=team,
                user=self.request.user,
            ))
        project_list.sort(key=lambda x: x.name)

        return {
            'projects': project_list,
            'projects_count': len(project_list),
            'organizations': org_list,
            'organizations_count': len(org_list),
            'teams': team_list,
            'teams_count': len(team_list)
        }
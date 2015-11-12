from __future__ import absolute_import
from django.shortcuts import get_object_or_404
from cobra.apps.svnkit.utils.util import get_readme
from cobra.core.loading import get_model, get_class
from django.utils.translation import ugettext_lazy as _
from django.views import generic
from cobra.views.generic import ProjectView


Organization = get_model('organization', 'Organization')
Team = get_model('team', 'Team')
Project = get_model('project', 'Project')
Repository = get_model('svnkit', 'Repository')


class OverviewView(ProjectView):
    # template_name = 'organization/project/overview.html'
    def get(self, request, organization, team, project):
        self.project = project
        repository = self.get_repository()
        readme = get_readme(repository)

        context = {
            'active_nav': 'overview',
            'readme': readme
        }
        return self.respond('organization/project/overview.html', context)

    def get_repository(self):
        repository_lookup = {'project': self.project}
        repository = get_object_or_404(
            Repository, **repository_lookup)
        return repository
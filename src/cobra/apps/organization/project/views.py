from __future__ import absolute_import
from cobra.core.loading import get_model, get_class
from django.utils.translation import ugettext_lazy as _
from django.views import generic
from cobra.views.generic import ProjectView


Organization = get_model('organization', 'Organization')
Team = get_model('team', 'Team')
Project = get_model('project', 'Project')


class OverviewView(ProjectView):
    # template_name = 'organization/project/overview.html'
    def get(self, request, organization, team, project):

        context = {
            'active_nav': 'overview'
        }

        return self.respond('organization/project/overview.html', context)
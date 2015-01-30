from django.contrib import messages
from django.core.urlresolvers import reverse

from cobra.core.loading import get_model, get_class
from cobra.views.generic import OrganizationView

Team = get_model('team', 'Team')
OrganizationMember = get_model('organization', 'OrganizationMember')
AddProjectWithTeamForm = get_class('project.forms', 'AddProjectWithTeamForm')
OrganizationMemberType = get_class('organization.utils', 'OrganizationMemberType')

ERR_NO_TEAMS = 'You cannot create a new project because there are no teams to assign it to.'

class ProjectCreateView(OrganizationView):
    # TODO(dcramer): I'm 95% certain the access is incorrect here as it would
    # be probably validating against global org access, and all we care about is
    # team admin
    def get_form(self, request, organization, team_list):
        return AddProjectWithTeamForm(request.user, team_list, request.POST or None, initial={
            'team': request.GET.get('team'),
        })

    def has_permission(self, request, organization):
        if organization is None:
            return False
        if request.user.is_superuser:
            return True
        # we special case permissions here as a team admin can create projects
        # but they are restricted to only creating projects on teams where they
        # are an admin
        return OrganizationMember.objects.filter(
            user=request.user,
            type__lte=OrganizationMemberType.ADMIN,
        )

    def handle(self, request, organization):
        team_list = Team.objects.get_for_user(
            organization=organization,
            user=request.user,
            access=OrganizationMemberType.ADMIN,
        )
        if not team_list:
            messages.error(request, ERR_NO_TEAMS)
            return self.redirect(reverse('organization:home', args=[organization.slug]))

        form = self.get_form(request, organization, team_list)
        if form.is_valid():
            project = form.save(request.user, request.META['REMOTE_ADDR'])

            url = reverse('cobra-stream', args=[organization.slug, project.slug])

            return self.redirect(url + '?newinstall=1')

        context = {
            'form': form,
        }

        return self.respond('project/create.html', context)

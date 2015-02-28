from uuid import uuid1

from django.contrib import messages
from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect
from django.utils.translation import ugettext_lazy as _

from cobra.core.loading import get_model, get_class
from cobra.core.permissions import can_remove_project
from cobra.core.plugins import plugins
from cobra.views.generic import OrganizationView, ProjectView
from cobra.views.mixins import PageTitleMixin

Team = get_model('team', 'Team')
OrganizationMember = get_model('organization', 'OrganizationMember')
AuditLogEntry = get_model('auditlog', 'AuditLogEntry')
AddProjectWithTeamForm = get_class('project.forms', 'AddProjectWithTeamForm')
ProjectEditForm = get_class('project.forms', 'ProjectEditForm')
OrganizationMemberType = get_class('organization.utils', 'OrganizationMemberType')
AuditLogEntryEvent = get_class('auditlog.utils', 'AuditLogEntryEvent')

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

            url = reverse('svnkit:node', args=[organization.slug, project.slug, '/'])

            return self.redirect(url + '?newinstall=1')

        context = {
            'form': form,
        }

        return self.respond('project/create.html', context)


class ProjectSettingsView(ProjectView):
    required_access = OrganizationMemberType.ADMIN

    def has_permission(self, request, organization, team, project):
        if project is None:
            return False

        if request.user.is_superuser:
            return True

        result = plugins.first('has_perm', request.user, 'edit_project', project)
        if result is False:
            return False

        return True

    def get_form(self, request, project):
        organization = project.organization
        if request.user.is_superuser:
            accessing_user = organization.owner
        else:
            accessing_user = request.user

        team_list = Team.objects.get_for_user(
            organization=organization,
            user=accessing_user,
            access=OrganizationMemberType.ADMIN,
        )

        # TODO(dcramer): this update should happen within a lock
        security_token = project.get_option('cobra:token', None)
        if security_token is None:
            security_token = uuid1().hex
            project.update_option('cobra:token', security_token)

        return ProjectEditForm(
            request, organization, team_list, request.POST or None,
            instance=project, initial={
                'svn_url': project.repository.root,
                'svn_repo_prefix': project.repository.prefix,
                'svn_username': project.repository.username,
                'svn_password': project.repository.password,
                'token': security_token,
            },
        )

    def handle(self, request, organization, team, project):
        form = self.get_form(request, project)

        if form.is_valid():
            project = form.save()
            for opt in ('token',):
                value = form.cleaned_data.get(opt)
                if value is None:
                    project.delete_option('cobra:%s' % (opt,))
                else:
                    project.update_option('cobra:%s' % (opt,), value)

            project.repository.root = form.cleaned_data.get('svn_url')
            project.repository.prefix = form.cleaned_data.get('svn_repo_prefix')
            project.repository.username = form.cleaned_data.get('svn_username')
            project.repository.password = form.cleaned_data.get('svn_password')
            project.repository.save()

            AuditLogEntry.objects.create(
                organization=organization,
                actor=request.user,
                ip_address=request.META['REMOTE_ADDR'],
                target_object=project.id,
                event=AuditLogEntryEvent.PROJECT_EDIT,
                data=project.get_audit_log_data(),
            )

            messages.add_message(
                request, messages.SUCCESS,
                _('Changes to your project were saved.'))

            redirect = reverse('project:settings', args=[project.slug, project.organization.slug])

            return HttpResponseRedirect(redirect)

        context = {
            'form': form,
            'can_remove_project': can_remove_project(request.user, project),
            'active_nav': 'settings',
            'active_tab':'details'
        }

        return self.respond('project/settings.html', context)

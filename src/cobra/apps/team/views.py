from __future__ import absolute_import

import logging
from django import forms
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.db.models import Q
from django.forms.models import modelform_factory
from django.http import HttpResponseRedirect
from django.utils.translation import ugettext_lazy as _

from cobra.views.generic import OrganizationView, missing_perm, TeamView
from cobra.core.loading import get_class, get_model
from cobra.core.permissions import can_create_teams, Permissions
from cobra.core.plugins import plugins

Team = get_model('team', 'Team')
OrganizationMember = get_model('organization', 'OrganizationMember')
AuditLogEntry = get_model('auditlog', 'AuditLogEntry')

OrganizationMemberType = get_class('organization.utils', 'OrganizationMemberType')
AddProjectForm = get_class('project.forms', 'AddProjectForm')
AddTeamForm = get_class('team.forms', 'AddTeamForm')
AuditLogEntryEvent = get_class('auditlog.utils', 'AuditLogEntryEvent')
TeamStatus = get_class('team.utils', 'TeamStatus')


class Step(object):
    def __init__(self, form, template, can_skip=False):
        self.form = form
        self.template = template
        self.can_skip = can_skip

    def __repr__(self):
        return '<%s: form=%s template=%s>' % (
            type(self).__name__, self.form.__name__, self.template
        )


class TeamCreateView(OrganizationView):
    required_access = OrganizationMemberType.ADMIN

    session_key = 'ctwizard'

    form_prefix = 'ctwizard'

    steps = [
        Step(form=AddTeamForm, template='create-team-step-team.html'),
        Step(form=AddProjectForm, template='create-team-step-project.html', can_skip=True),
    ]

    # A lot of this logic is inspired by Django's FormWizard, but unfortunately
    # using that requires us to inherit from Django's base CBVs which is not
    # acceptable due to the way we handle base view validation and ACLs.
    def handle(self, request, organization):
        if not can_create_teams(request.user, organization):
            return missing_perm(request, Permissions.ADD_TEAM)

        session_data = request.session.get(self.session_key, {})
        if request.method == 'GET':
            logging.debug('GET request; resetting create team form wizard')
            current_step = 0
            try:
                del request.session[self.session_key]
            except KeyError:
                pass
        else:
            current_step = int(request.POST.get('step', 0))

        last_step = len(self.steps) - 1

        if current_step > last_step:
            logging.debug('Invalid step passed; resetting create team form wizard')
            return self.render_validation_error(request, organization)

        op = request.POST.get('op')
        if op != 'continue':
            data = None
        else:
            data = request.POST or None

        form = self.get_step_form(current_step, data)
        if op == 'continue' and form.is_valid():
            session_data['step%d' % current_step] = form.cleaned_data
            request.session[self.session_key] = session_data
            if current_step == last_step:
                # no more steps, render done view
                return self.render_done(request, organization, form)
            else:
                # proceed to the next step
                return self.render_next_step(request, organization, current_step + 1)

        elif op == 'back' and current_step > 0:
            return self.render_next_step(request, organization, current_step - 1)

        elif op == 'skip' and current_step > 0:
            session_data['step%d' % current_step] = {}
            request.session[self.session_key] = session_data
            if current_step == last_step:
                # no more steps, render done view
                return self.render_done(request, organization, form)
            else:
                # proceed to the next step
                return self.render_next_step(request, organization, current_step + 1)

        return self.render(request, organization, current_step, form)

    def get_step_form(self, step, data=None, with_prefix=True):
        if with_prefix:
            prefix = '%s-%d' % (self.form_prefix, step)
        else:
            prefix = None

        return self.steps[step].form(
            data=data,
            prefix=prefix,
        )

    def render(self, request, organization, step, form):
        template = self.steps[step].template
        context = {
            'current_step': step,
            'step': step,
            'form': form,
            'first_step': 0,
        }
        return self.respond('team/%s' % (template,), context)

    def render_next_step(self, request, organization, step):
        form = self.get_step_form(step)
        return self.render(request, organization, step, form)

    def render_validation_error(self, request, organization):
        try:
            del request.session[self.session_key]
        except KeyError:
            pass

        messages.error(request, 'There was an issue validating your input. Please try again.')

        return self.redirect(request.get_full_path())

    def render_done(self, request, organization, last_form):
        all_forms = []
        session_data = request.session[self.session_key]
        last_index = len(self.steps) - 1
        # revalidate previous steps
        for index in range(len(self.steps)):
            if index == last_index:
                form = last_form
            else:
                form = self.get_step_form(
                    step=index,
                    data=session_data.get('step%d' % (index,), {}),
                    with_prefix=False,
                )

            if self.steps[index].can_skip and not form.data:
                pass
            elif not form.is_valid():
                logging.warning('step %d (%s) did not validate; resetting create team wizard',
                              index, type(form).__name__)
                return self.render_validation_error(request, organization)

            all_forms.append(form)

        try:
            return self.save(request, organization, all_forms)
        finally:
            del request.session[self.session_key]

    def save(self, request, organization, all_forms):
        team = all_forms[0].save(request.user, organization, request.META['REMOTE_ADDR'])

        if all_forms[1].is_valid():
            project = all_forms[1].save(request.user, team, request.META['REMOTE_ADDR'])

            url = '/'#reverse('cobra-stream', args=[organization.slug, project.slug]) + '?newinstall=1'
        else:
            messages.success(request, 'Your new team was created successfully.')

            url = reverse('organization:home', args=[organization.slug])

        return self.redirect(url)


EditTeamForm = modelform_factory(Team, fields=('name', 'slug',))

class TeamSettingsView(TeamView):
    required_access = OrganizationMemberType.ADMIN

    def get_form(self, request, team):
        return EditTeamForm(request.POST or None, instance=team)

    def handle(self, request, organization, team):
        result = plugins.first('has_perm', request.user, 'edit_team', team)
        if result is False and not request.user.is_superuser:
            return HttpResponseRedirect(reverse('home:home'))

        form = self.get_form(request, team)
        if form.is_valid():
            team = form.save()

            AuditLogEntry.objects.create(
                organization=organization,
                actor=request.user,
                ip_address=request.META['REMOTE_ADDR'],
                target_object=team.id,
                target=team,
                event=AuditLogEntryEvent.TEAM_EDIT,
                data=team.get_audit_log_data(),
            )

            messages.add_message(request, messages.SUCCESS,
                _('Changes to your team were saved.'))

            return HttpResponseRedirect(reverse('team:manage', args=[team.slug, organization.slug]))

        if request.user.is_superuser:
            can_remove_team = True
        else:
            can_remove_team = OrganizationMember.objects.filter(
                Q(has_global_access=True) | Q(teams=team),
                user=request.user,
                type__lte=OrganizationMemberType.OWNER,
            ).exists()

        context = {
            'form': form,
            'can_remove_team': can_remove_team,
        }

        return self.respond('team/manage.html', context)


class TeamRemoveForm(forms.Form):
    pass

class TeamRemoveView(TeamView):
    required_access = OrganizationMemberType.OWNER
    sudo_required = True

    def get_form(self, request):
        if request.method == 'POST':
            return TeamRemoveForm(request.POST)
        return TeamRemoveForm(None)

    def handle(self, request, organization, team):
        form = self.get_form(request)

        if form.is_valid():
            updated = Team.objects.filter(
                id=team.id,
                status=TeamStatus.VISIBLE,
            ).update(status=TeamStatus.PENDING_DELETION)
            if updated:
                delete_team.delay(object_id=team.id, countdown=60 * 5)

                AuditLogEntry.objects.create(
                    organization=organization,
                    actor=request.user,
                    ip_address=request.META['REMOTE_ADDR'],
                    target_object=team.id,
                    target=team,
                    event=AuditLogEntryEvent.TEAM_REMOVE,
                    data=team.get_audit_log_data(),
                )

            messages.add_message(
                request, messages.SUCCESS,
                _(u'The team %r was scheduled for deletion.') % (team.name.encode('utf-8'),))

            return HttpResponseRedirect(reverse('home:home'))

        context = {
            'form': form,
        }

        return self.respond('team/remove.html', context)

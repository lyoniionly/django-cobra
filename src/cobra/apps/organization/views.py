from __future__ import absolute_import

from django import forms
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.forms.models import modelform_factory
from django.http import HttpResponseRedirect
from django.utils.translation import ugettext_lazy as _

from cobra.core.loading import get_model, get_class, get_classes
from cobra.views.generic import OrganizationView, BaseView
from cobra.core.permissions import can_create_organizations

Organization = get_model('organization', 'Organization')
Team = get_model('team', 'Team')
AuditLogEntry = get_model('auditlog', 'AuditLogEntry')

OrganizationStatus, OrganizationMemberType = get_classes('organization.utils',
                                                       ['OrganizationStatus', 'OrganizationMemberType'])
OrganizationCreateForm = get_class('organization.forms', 'OrganizationCreateForm')
AuditLogEntryEvent = get_class('auditlog.utils', 'AuditLogEntryEvent')


class OrganizationHomeView(OrganizationView):
    def get(self, request, organization):
        team_list = Team.objects.get_for_user(
            organization=organization,
            user=request.user,
            with_projects=True,
        )

        context = {
            'team_list': team_list,
        }

        return self.respond('organization/home.html', context)


class OrganizationCreateView(BaseView):
    def get_form(self, request):
        return OrganizationCreateForm(request.POST or None)

    def has_permission(self, request, *args, **kwargs):
        if not can_create_organizations(request.user):
            return False
        return True

    def handle(self, request):
        form = self.get_form(request)
        if form.is_valid():
            org = form.save(commit=False)
            org.owner = request.user
            org.save()

            AuditLogEntry.objects.create(
                organization=org,
                actor=request.user,
                ip_address=request.META['REMOTE_ADDR'],
                target_object=org.id,
                event=AuditLogEntryEvent.ORG_ADD,
                data=org.get_audit_log_data(),
            )

            url = reverse('team:create', args=[org.slug])

            return HttpResponseRedirect(url)

        context = {
            'form': form,
        }

        return self.respond('organization/create.html', context)


OrganizationSettingsForm = modelform_factory(Organization, fields=('name', 'slug',))

class OrganizationSettingsView(OrganizationView):
    required_access = OrganizationMemberType.ADMIN

    def get_form(self, request, organization):
        return OrganizationSettingsForm(
            request.POST or None,
            instance=organization
        )

    def handle(self, request, organization):
        form = self.get_form(request, organization)
        if form.is_valid():
            form.save()

            AuditLogEntry.objects.create(
                organization=organization,
                actor=request.user,
                ip_address=request.META['REMOTE_ADDR'],
                target_object=organization.id,
                event=AuditLogEntryEvent.ORG_EDIT,
                data=organization.get_audit_log_data(),
            )

            messages.add_message(request, messages.SUCCESS,
                _('Changes to your organization were saved.'))

            return HttpResponseRedirect(reverse('organization:settings', args=[organization.slug]))

        context = {
            'form': form,
        }

        return self.respond('organization/settings.html', context)


MSG_REMOVE_SUCCESS = _('The %s organization has been scheduled for removal.')

class OrganizationRemoveForm(forms.Form):
    pass

class OrganizationRemoveView(OrganizationView):
    required_access = OrganizationMemberType.OWNER
    sudo_required = True

    def get_form(self, request, organization):
        if request.method == 'POST':
            return OrganizationRemoveForm(request.POST)
        return OrganizationRemoveForm()

    def handle(self, request, organization):
        form = self.get_form(request, organization)
        if form.is_valid():
            if organization.status != OrganizationStatus.PENDING_DELETION:
                organization.update(status=OrganizationStatus.PENDING_DELETION)

                delete_organization.apply_async(kwargs={
                    'object_id': organization.id,
                }, countdown=60 * 5)

            messages.add_message(request, messages.SUCCESS,
                MSG_REMOVE_SUCCESS % (organization.name,))

            return self.redirect(reverse('home:home'))

        context = {
            'form': form,
            'team_list': organization.team_set.all(),
        }

        return self.respond('organization/remove.html', context)
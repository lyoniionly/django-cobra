from __future__ import absolute_import

from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect

from cobra.core.loading import get_model, get_class
from cobra.views.generic import OrganizationView, BaseView
from cobra.core.permissions import can_create_organizations

Team = get_model('team', 'Team')
AuditLogEntry = get_model('auditlog', 'AuditLogEntry')
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

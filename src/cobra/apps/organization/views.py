from __future__ import absolute_import
from collections import defaultdict

from django import forms
from django.conf import settings
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.forms.models import modelform_factory
from django.http import HttpResponseRedirect
from django.utils.translation import ugettext_lazy as _, ugettext
from django.views.generic import ListView

from cobra.core.loading import get_model, get_class, get_classes
from cobra.views.generic import OrganizationView, BaseView
from cobra.core.permissions import can_create_organizations, can_add_organization_member

Organization = get_model('organization', 'Organization')
OrganizationMember = get_model('organization', 'OrganizationMember')
OrganizationDepartment = get_model('organization', 'OrganizationDepartment')
Team = get_model('team', 'Team')
Project = get_model('project', 'Project')
AuditLogEntry = get_model('auditlog', 'AuditLogEntry')

OrganizationStatus, OrganizationMemberType = get_classes('organization.utils',
                                                       ['OrganizationStatus', 'OrganizationMemberType'])
OrganizationCreateForm = get_class('organization.forms', 'OrganizationCreateForm')
OrganizationMemberEditForm = get_class('organization.forms', 'OrganizationMemberEditForm')
OrganizationMemberInviteForm = get_class('organization.forms', 'OrganizationMemberInviteForm')
OrganizationMemberCreateForm = get_class('organization.forms', 'OrganizationMemberCreateForm')
AuditLogEntryEvent = get_class('auditlog.utils', 'AuditLogEntryEvent')


class OrganizationHomeView(OrganizationView):
    def get(self, request, organization):
        # team_list = Team.objects.get_for_user(
        #     organization=organization,
        #     user=request.user,
        #     with_projects=True,
        # )

        context = {
            # 'team_list': team_list,
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

            # create department root for this org
            OrganizationDepartment.objects.create(
                name=org.name, organization=org
            )

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


OrganizationSettingsForm = modelform_factory(Organization, fields=('name', 'slug', 'avatar'))

class OrganizationSettingsView(OrganizationView):
    required_access = OrganizationMemberType.ADMIN

    def get_form(self, request, organization):
        return OrganizationSettingsForm(
            request.POST or None, request.FILES or None,
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


class OrganizationMembersView(OrganizationView):
    def handle(self, request, organization):
        if request.user.is_superuser:
            authorizing_access = OrganizationMemberType.OWNER
        else:
            authorizing_access = OrganizationMember.objects.get(
                user=request.user,
                organization=organization,
            ).type

        queryset = OrganizationMember.teams.through.objects.filter(
            organizationmember__organization=organization,
        ).select_related('team')

        team_map = defaultdict(list)
        for omt in queryset:
            team_map[omt.organizationmember_id].append(omt.team)

        queryset = OrganizationMember.objects.filter(
            organization=organization,
        ).select_related('user')

        queryset = sorted(queryset, key=lambda x: x.email or x.user.get_display_name())

        member_list = []
        for om in queryset:
            member_list.append((om, team_map[om.id]))

        # if the member is not the only owner we allow them to leave the org
        member_can_leave = any(
            1 for om, _ in member_list
            if om.type == OrganizationMemberType.OWNER and om.user != request.user
        )

        context = {
            'member_list': member_list,
            'authorizing_access': authorizing_access,
            'member_can_leave': member_can_leave,
        }

        return self.respond('organization/members.html', context)


class OrganizationMemberCreateView(OrganizationView):
    required_access = OrganizationMemberType.ADMIN

    def get_form(self, request):
        initial = {
            'type': OrganizationMemberType.MEMBER,
        }

        if settings.COBRA_ENABLE_INVITES:
            form_cls = OrganizationMemberInviteForm
        else:
            form_cls = OrganizationMemberCreateForm

        return form_cls(request.POST or None, initial=initial)

    def handle(self, request, organization):
        if not can_add_organization_member(request.user, organization):
            return HttpResponseRedirect(reverse('home:home'))

        form = self.get_form(request)
        if form.is_valid():
            om, created = form.save(request.user, organization, request.META['REMOTE_ADDR'])

            if created:
                messages.add_message(request, messages.SUCCESS,
                    _('The organization member was added.'))
            else:
                messages.add_message(request, messages.INFO,
                    _('The organization member already exists.'))

            redirect = reverse('organization:member-settings',
                               args=[organization.slug, om.id])

            return HttpResponseRedirect(redirect)

        context = {
            'form': form,
            'is_invite': settings.COBRA_ENABLE_INVITES,
        }

        return self.respond('organization/member-create.html', context)


class OrganizationMemberSettingsView(OrganizationView):
    required_access = OrganizationMemberType.ADMIN

    def get_form(self, request, member, authorizing_access):
        return OrganizationMemberEditForm(
            authorizing_access=authorizing_access,
            data=request.POST or None,
            instance=member,
            initial={
                'type': member.type,
                'has_global_access': member.has_global_access,
                'teams': member.teams.all(),
            }
        )

    def resend_invite(self, request, organization, member):
        messages.success(request, ugettext('An invitation to join %(organization)s has been sent to %(email)s') % {
            'organization': organization.name,
            'email': member.email,
        })

        member.send_invite_email()

        redirect = reverse('organization:member-settings',
                           args=[organization.slug, member.id])

        return self.redirect(redirect)

    def view_member(self, request, organization, member):
        context = {
            'member': member,
            'enabled_teams': set(member.teams.all()),
            'all_teams': Team.objects.filter(
                organization=organization,
            ),
        }

        return self.respond('organization/member-details.html', context)

    def handle(self, request, organization, member_id):
        try:
            member = OrganizationMember.objects.get(id=member_id)
        except OrganizationMember.DoesNotExist:
            print("cannot find member id")
            return self.redirect(reverse('home:home'))

        if request.POST.get('op') == 'reinvite' and member.is_pending:
            return self.resend_invite(request, organization, member)

        if request.user.is_superuser:
            authorizing_access = OrganizationMemberType.OWNER
        else:
            membership = OrganizationMember.objects.get(
                user=request.user,
                organization=organization,
            )
            authorizing_access = membership.type

        if member.user == request.user or authorizing_access > member.type:
            return self.view_member(request, organization, member)

        form = self.get_form(request, member, authorizing_access)
        if form.is_valid():
            member = form.save(request.user, organization, request.META['REMOTE_ADDR'])

            messages.add_message(request, messages.SUCCESS,
                _('Your changes were saved.'))

            redirect = reverse('organization:member-settings',
                               args=[organization.slug, member.id])

            return self.redirect(redirect)

        context = {
            'member': member,
            'form': form,
        }

        return self.respond('organization/member-settings.html', context)


class AcceptInviteForm(forms.Form):
    pass

class OrganizationMemberAcceptView(BaseView):
    auth_required = False

    def get_form(self, request):
        if request.method == 'POST':
            return AcceptInviteForm(request.POST)
        return AcceptInviteForm()

    def handle(self, request, member_id, token):
        assert request.method in ['POST', 'GET']

        try:
            om = OrganizationMember.objects.get(pk=member_id)
        except OrganizationMember.DoesNotExist:
            messages.add_message(
                request, messages.ERROR,
                _('The invite link you followed is no longer valid.')
            )

            return self.redirect(reverse('home:home'))

        if not om.is_pending:
            messages.add_message(
                request, messages.ERROR,
                _('The invite link you followed is no longer valid.')
            )

            return self.redirect(reverse('home:home'))

        if om.token != token:
            messages.add_message(
                request, messages.ERROR,
                _('The invite link you followed is no longer valid.')
            )
            return self.redirect(reverse('home:home'))

        organization = om.organization

        if om.has_global_access:
            qs = Project.objects.filter(
                team__organization=organization,
            )
        else:
            qs = Project.objects.filter(
                team__in=om.teams.all(),
            )

        qs = qs.select_related('team')

        project_list = list(qs)

        context = {
            'organization': om.organization,
            'project_list': project_list,
            'needs_authentication': not request.user.is_authenticated(),
        }

        if not request.user.is_authenticated():
            # Show login or register form
            request.session['_next'] = request.get_full_path()
            request.session['can_register'] = True

            return self.respond('organization/member-accept-invite.html', context)

        form = self.get_form(request)
        if form.is_valid():
            if OrganizationMember.objects.filter(organization=organization, user=request.user).exists():
                messages.add_message(
                    request, messages.SUCCESS,
                    _('You are already a member of the %r organization.') % (
                        organization.name.encode('utf-8'),
                    )
                )

                om.delete()
            else:
                om.user = request.user
                om.email = None
                om.save()

                AuditLogEntry.objects.create(
                    organization=organization,
                    actor=request.user,
                    ip_address=request.META['REMOTE_ADDR'],
                    target_object=om.id,
                    target_user=request.user,
                    event=AuditLogEntryEvent.MEMBER_ACCEPT,
                    data=om.get_audit_log_data(),
                )

                messages.add_message(
                    request, messages.SUCCESS,
                    _('You have been added to the %r organization.') % (
                        organization.name.encode('utf-8'),
                    )
                )

            request.session.pop('can_register', None)

            return self.redirect(reverse('organization:home', args=[organization.slug]))

        context['form'] = form

        return self.respond('organization/member-accept-invite.html', context)


class OrganizationMyListView(ListView):
    model = Organization
    context_object_name = 'organizations'
    template_name = 'organization/my_organizations.html'

    def get_queryset(self):
        return Organization.objects.get_for_user(user=self.request.user)
        
        
class OrganizationAllListView(ListView):
    model = Organization
    context_object_name = 'organizations'
    template_name = 'organization/all_organizations.html'

    def get_queryset(self):
        return Organization.objects.all()


class AcceptJoinForm(forms.Form):
    pass
class OrganizationJoinView(BaseView):
    auth_required = False

    def get_form(self, request):
        if request.method == 'POST':
            return AcceptJoinForm(request.POST)
        return AcceptJoinForm()

    def handle(self, request, organization_slug):
        assert request.method in ['POST', 'GET']

        context = {}
        
        try:
            organization = Organization.objects.get_from_cache(
                slug=organization_slug,
            )
            if organization.status != OrganizationStatus.VISIBLE:
                context['message'] = _('The Organization [%s] not found'%organization_slug)
                return self.respond('organization/error.html', context)
        except Organization.DoesNotExist:
            context['message'] = _('The Organization [%s] not found'%organization_slug)
            return self.respond('organization/error.html', context)

        qs = Project.objects.filter(
            team__organization=organization,
        )

        qs = qs.select_related('team')

        project_list = list(qs)

        context.update({
            'organization': organization,
            'project_list': project_list,
            'needs_authentication': not request.user.is_authenticated(),
        })

        if not request.user.is_authenticated():
            # Show login or register form
            request.session['_next'] = request.get_full_path()
            request.session['can_register'] = True

            return self.respond('organization/member-accept-invite.html', context)

        form = self.get_form(request)
        if form.is_valid():
            if OrganizationMember.objects.filter(organization=organization, user=request.user).exists():
                messages.add_message(
                    request, messages.SUCCESS,
                    _('You are already a member of the %r organization.') % (
                        organization.name,
                    )
                )
            else:
                om = OrganizationMember.objects.create(
                    organization=organization,
                    user=request.user,
                    type=OrganizationMemberType.MEMBER,
                    email=request.user.email)

                AuditLogEntry.objects.create(
                    organization=organization,
                    actor=request.user,
                    ip_address=request.META['REMOTE_ADDR'],
                    target_object=om.id,
                    target_user=request.user,
                    event=AuditLogEntryEvent.MEMBER_ACCEPT,
                    data=om.get_audit_log_data(),
                )

                messages.add_message(
                    request, messages.SUCCESS,
                    _('You have been added to the %r organization.') % (
                        organization.name.encode('utf-8'),
                    )
                )

            request.session.pop('can_register', None)

            return self.redirect(reverse('organization:home', args=[organization.slug]))

        context['form'] = form

        return self.respond('organization/member-accept-invite.html', context)
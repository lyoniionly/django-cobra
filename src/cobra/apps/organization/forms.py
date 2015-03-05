# -*- coding: utf-8 -*-
from __future__ import absolute_import

from django import forms
from django.db import transaction, IntegrityError
from django.utils.translation import ugettext_lazy as _

from cobra.core.loading import get_model, get_class
from cobra.forms.fields import UserField

Organization = get_model('organization', 'Organization')
OrganizationMember = get_model('organization', 'OrganizationMember')
Team = get_model('team', 'Team')
AuditLogEntry = get_model('auditlog', 'AuditLogEntry')
OrganizationMemberType = get_class('organization.utils', 'OrganizationMemberType')
AuditLogEntryEvent = get_class('auditlog.utils', 'AuditLogEntryEvent')


class OrganizationCreateForm(forms.ModelForm):
    name = forms.CharField(label=_('Organization Name'), max_length=200,
        widget=forms.TextInput(attrs={'placeholder': _('My Company')}))

    class Meta:
        fields = ('name',)
        model = Organization


MEMBERSHIP_CHOICES = (
    (OrganizationMemberType.MEMBER, _('Member')),
    (OrganizationMemberType.ADMIN, _('Admin')),
    (OrganizationMemberType.OWNER, _('Owner')),
)

class OrganizationMemberEditForm(forms.ModelForm):
    type = forms.TypedChoiceField(label=_('Membership Type'), choices=(), coerce=int)
    has_global_access = forms.BooleanField(
        label=_('This member should have access to all teams within the organization.'),
        required=False,
    )
    teams = forms.ModelMultipleChoiceField(
        queryset=Team.objects.none(),
        widget=forms.CheckboxSelectMultiple(),
        required=False,
    )

    class Meta:
        fields = ('type', 'has_global_access', 'teams')
        model = OrganizationMember

    def __init__(self, authorizing_access, *args, **kwargs):
        super(OrganizationMemberEditForm, self).__init__(*args, **kwargs)

        self.fields['type'].choices = [
            m for m in MEMBERSHIP_CHOICES
            if m[0] >= authorizing_access
        ]
        self.fields['teams'].queryset = Team.objects.filter(
            organization=self.instance.organization,
        )

    def save(self, actor, organization, ip_address=None):
        if self.cleaned_data['has_global_access']:
            self.cleaned_data['teams'] = []

        om = super(OrganizationMemberEditForm, self).save()

        AuditLogEntry.objects.create(
            organization=organization,
            actor=actor,
            ip_address=ip_address,
            target_object=om.id,
            target=om,
            target_user=om.user,
            event=AuditLogEntryEvent.MEMBER_EDIT,
            data=om.get_audit_log_data(),
        )

        return om


class OrganizationMemberCreateForm(forms.ModelForm):
    user = UserField()

    class Meta:
        fields = ('user',)
        model = OrganizationMember

    def save(self, actor, organization, ip_address):
        om = super(OrganizationMemberCreateForm, self).save(commit=False)
        om.organization = organization
        om.type = OrganizationMemberType.MEMBER

        sid = transaction.savepoint(using='default')
        try:
            om.save()
        except IntegrityError:
            transaction.savepoint_rollback(sid, using='default')
            return OrganizationMember.objects.get(
                user=om.user,
                organization=organization,
            ), False
        transaction.savepoint_commit(sid, using='default')

        AuditLogEntry.objects.create(
            organization=organization,
            actor=actor,
            ip_address=ip_address,
            target_object=om.id,
            target=om,
            target_user=om.user,
            event=AuditLogEntryEvent.MEMBER_ADD,
            data=om.get_audit_log_data(),
        )

        return om, True


class OrganizationMemberInviteForm(forms.ModelForm):
    class Meta:
        fields = ('email',)
        model = OrganizationMember

    def save(self, actor, organization, ip_address):
        om = super(OrganizationMemberInviteForm, self).save(commit=False)
        om.organization = organization
        om.type = OrganizationMemberType.MEMBER

        try:
            existing = OrganizationMember.objects.get(
                organization=organization,
                user__email__iexact=om.email,
            )
        except OrganizationMember.DoesNotExist:
            pass
        else:
            return existing, False

        sid = transaction.savepoint(using='default')
        try:
            om.save()
        except IntegrityError:
            transaction.savepoint_rollback(sid, using='default')
            return OrganizationMember.objects.get(
                email__iexact=om.email,
                organization=organization,
            ), False
        transaction.savepoint_commit(sid, using='default')

        AuditLogEntry.objects.create(
            organization=organization,
            actor=actor,
            ip_address=ip_address,
            target_object=om.id,
            target=om,
            event=AuditLogEntryEvent.MEMBER_INVITE,
            data=om.get_audit_log_data(),
        )

        om.send_invite_email()

        return om, True

from __future__ import absolute_import, print_function
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ObjectDoesNotExist

from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils import timezone
from django.utils.safestring import mark_safe

from cobra.core.compat import AUTH_USER_MODEL, generic
from cobra.core.http import generate_hyperlink
from cobra.core.loading import get_model
from cobra.models import Model, fields, sane_repr

from .utils import AuditLogEntryEvent


Organization = get_model('organization', 'Organization')
Team = get_model('team', 'Team')
Project = get_model('project', 'Project')

@python_2_unicode_compatible
class AbstractAuditLogEntry(Model):
    """
    Audit log to store some important information.
    """
    organization = fields.FlexibleForeignKey('organization.Organization')
    actor = fields.FlexibleForeignKey(AUTH_USER_MODEL, related_name='audit_actors')
    target_object = fields.BoundedPositiveIntegerField(null=True)

    target_user = fields.FlexibleForeignKey(AUTH_USER_MODEL, null=True, blank=True,
                                    related_name='audit_targets')
    event = fields.BoundedPositiveIntegerField(choices=(
        # We emulate github a bit with event naming
        (AuditLogEntryEvent.MEMBER_INVITE, 'member.invite'),
        (AuditLogEntryEvent.MEMBER_ADD, 'member.add'),
        (AuditLogEntryEvent.MEMBER_ACCEPT, 'member.accept-invite'),
        (AuditLogEntryEvent.MEMBER_REMOVE, 'member.remove'),
        (AuditLogEntryEvent.MEMBER_EDIT, 'member.edit'),

        (AuditLogEntryEvent.TEAM_ADD, 'team.create'),
        (AuditLogEntryEvent.TEAM_EDIT, 'team.edit'),
        (AuditLogEntryEvent.TEAM_REMOVE, 'team.remove'),

        (AuditLogEntryEvent.PROJECT_ADD, 'project.create'),
        (AuditLogEntryEvent.PROJECT_EDIT, 'project.edit'),
        (AuditLogEntryEvent.PROJECT_REMOVE, 'project.remove'),
        (AuditLogEntryEvent.PROJECT_SET_PUBLIC, 'project.set-public'),
        (AuditLogEntryEvent.PROJECT_SET_PRIVATE, 'project.set-private'),

        (AuditLogEntryEvent.ORG_ADD, 'org.create'),
        (AuditLogEntryEvent.ORG_EDIT, 'org.edit'),

        (AuditLogEntryEvent.TAGKEY_REMOVE, 'tagkey.remove'),

        (AuditLogEntryEvent.PROJECTKEY_ADD, 'projectkey.create'),
        (AuditLogEntryEvent.PROJECTKEY_EDIT, 'projectkey.edit'),
        (AuditLogEntryEvent.PROJECTKEY_REMOVE, 'projectkey.remove'),
        (AuditLogEntryEvent.PROJECTKEY_ENABLE, 'projectkey.enable'),
        (AuditLogEntryEvent.PROJECTKEY_DISABLE, 'projectkey.disable'),
    ))
    ip_address = models.GenericIPAddressField(null=True, unpack_ipv4=True)
    data = fields.GzippedDictField()
    datetime = models.DateTimeField(default=timezone.now)

    class Meta:
        abstract = True
        app_label = 'auditlog'
        db_table = 'cobra_auditlogentry'
        ordering = ('-datetime', )

    __repr__ = sane_repr('organization_id', 'type')

    def __str__(self):
        return ''

    def get_icon_font(self):
        return AuditLogEntryEvent.ICON_FONTS[self.event]

    def get_note(self):
        note = 'No valid note for this action'
        if self.event in (AuditLogEntryEvent.ORG_ADD, AuditLogEntryEvent.ORG_EDIT,):
            org = Organization.objects.get(pk=self.target_object)
            abs_url = org.get_absolute_url()
            note = AuditLogEntryEvent.TEMPLATE[self.event] % {
                'organization': generate_hyperlink(
                    org.name, abs_url, safe=False),
            }
        elif self.event in (AuditLogEntryEvent.TEAM_ADD, AuditLogEntryEvent.TEAM_EDIT, AuditLogEntryEvent.TEAM_REMOVE):
            try:
                team = Team.objects.get(pk=self.target_object)
                abs_url = team.get_absolute_url()
            except ObjectDoesNotExist:
                abs_url = ''
            note = AuditLogEntryEvent.TEMPLATE[self.event] % {
                'team': generate_hyperlink(self.data['name'], abs_url, safe=False),
                'organization': generate_hyperlink(
                    self.organization.name, self.organization.get_absolute_url(),safe=False),
            }
        elif self.event in (
            AuditLogEntryEvent.PROJECT_ADD, AuditLogEntryEvent.PROJECT_EDIT, AuditLogEntryEvent.PROJECT_REMOVE,
            AuditLogEntryEvent.PROJECT_SET_PUBLIC, AuditLogEntryEvent.PROJECT_SET_PRIVATE):
            try:
                project = Project.objects.get(pk=self.target_object)
                abs_url = project.get_absolute_url()
            except ObjectDoesNotExist:
                abs_url = ''
            note = AuditLogEntryEvent.TEMPLATE[self.event] % {
                'project': generate_hyperlink(self.data['name'], abs_url, safe=False),
                'organization': generate_hyperlink(
                    self.organization.name, self.organization.get_absolute_url(),safe=False),
            }



        if self.event == AuditLogEntryEvent.MEMBER_INVITE:
            note = 'invited member %s on organization %s' % (self.data['email'], generate_hyperlink(self.organization.name, self.organization.get_absolute_url(),safe=False),)
        elif self.event == AuditLogEntryEvent.MEMBER_ADD:
            if self.target_user == self.actor:
                note = 'joined the organization %s' % (generate_hyperlink(self.organization.name, self.organization.get_absolute_url(), safe=False),)
            else:
                note = 'added member %s on organization %s' % (generate_hyperlink(self.target_user.get_display_name(), self.target_user.get_absolute_url(),safe=False), generate_hyperlink(self.organization.name, self.organization.get_absolute_url(),safe=False),)
        elif self.event == AuditLogEntryEvent.MEMBER_ACCEPT:
            note = 'accepted the membership invite on organization %s' % (generate_hyperlink(self.organization.name, self.organization.get_absolute_url(),safe=False),)
        elif self.event == AuditLogEntryEvent.MEMBER_REMOVE:
            if self.target_user == self.actor:
                note = 'left the organization %s' % (generate_hyperlink(self.organization.name, self.organization.get_absolute_url(),safe=False),)
            else:
                note = 'removed member %s on organization %s' % (generate_hyperlink(self.target_user.get_display_name(), self.target_user.get_absolute_url(),safe=False), generate_hyperlink(self.organization.name, self.organization.get_absolute_url(),safe=False),)
        elif self.event == AuditLogEntryEvent.MEMBER_EDIT:
            note = 'edited member %s on organization %s' % (generate_hyperlink(self.target_user.get_display_name(), self.target_user.get_absolute_url(),safe=False), generate_hyperlink(self.organization.name, self.organization.get_absolute_url(),safe=False),)


        elif self.event == AuditLogEntryEvent.TAGKEY_REMOVE:
            note = 'removed tags matching %s = *' % (self.data['key'],)

        elif self.event == AuditLogEntryEvent.PROJECTKEY_ADD:
            note = 'added project key %s' % (self.data['public_key'],)
        elif self.event == AuditLogEntryEvent.PROJECTKEY_EDIT:
            note = 'edited project key %s' % (self.data['public_key'],)
        elif self.event == AuditLogEntryEvent.PROJECTKEY_REMOVE:
            note = 'removed project key %s' % (self.data['public_key'],)
        elif self.event == AuditLogEntryEvent.PROJECTKEY_ENABLE:
            note = 'enabled project key %s' % (self.data['public_key'],)
        elif self.event == AuditLogEntryEvent.PROJECTKEY_DISABLE:
            note = 'disabled project key %s' % (self.data['public_key'],)

        return mark_safe(note)
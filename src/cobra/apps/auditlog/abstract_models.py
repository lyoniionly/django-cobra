from __future__ import absolute_import, print_function

from django.db import models
from django.utils.encoding import python_2_unicode_compatible
from django.utils import timezone

from cobra.core.compat import AUTH_USER_MODEL
from cobra.models import Model
from cobra.models import fields
from cobra.models import sane_repr

from .utils import AuditLogEntryEvent


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

    __repr__ = sane_repr('organization_id', 'type')

    def __str__(self):
        return ''

    def get_note(self):
        if self.event == AuditLogEntryEvent.MEMBER_INVITE:
            return 'invited member %s' % (self.data['email'],)
        elif self.event == AuditLogEntryEvent.MEMBER_ADD:
            return 'added member %s' % (self.target_user.get_display_name(),)
        elif self.event == AuditLogEntryEvent.MEMBER_ACCEPT:
            return 'accepted the membership invite'
        elif self.event == AuditLogEntryEvent.MEMBER_REMOVE:
            if self.target_user == self.actor:
                return 'left the organization'
            return 'removed member %s' % (self.data.get('email') or self.target_user.get_display_name(),)
        elif self.event == AuditLogEntryEvent.MEMBER_EDIT:
            return 'edited member %s' % (self.data.get('email') or self.target_user.get_display_name(),)

        elif self.event == AuditLogEntryEvent.TEAM_ADD:
            return 'created team %s' % (self.data['slug'],)
        elif self.event == AuditLogEntryEvent.TEAM_EDIT:
            return 'edited team %s' % (self.data['slug'],)
        elif self.event == AuditLogEntryEvent.TEAM_REMOVE:
            return 'removed team %s' % (self.data['slug'],)

        elif self.event == AuditLogEntryEvent.PROJECT_ADD:
            return 'created project %s' % (self.data['slug'],)
        elif self.event == AuditLogEntryEvent.PROJECT_EDIT:
            return 'edited project %s' % (self.data['slug'],)
        elif self.event == AuditLogEntryEvent.PROJECT_REMOVE:
            return 'removed project %s' % (self.data['slug'],)

        elif self.event == AuditLogEntryEvent.TAGKEY_REMOVE:
            return 'removed tags matching %s = *' % (self.data['key'],)

        elif self.event == AuditLogEntryEvent.PROJECTKEY_ADD:
            return 'added project key %s' % (self.data['public_key'],)
        elif self.event == AuditLogEntryEvent.PROJECTKEY_EDIT:
            return 'edited project key %s' % (self.data['public_key'],)
        elif self.event == AuditLogEntryEvent.PROJECTKEY_REMOVE:
            return 'removed project key %s' % (self.data['public_key'],)
        elif self.event == AuditLogEntryEvent.PROJECTKEY_ENABLE:
            return 'enabled project key %s' % (self.data['public_key'],)
        elif self.event == AuditLogEntryEvent.PROJECTKEY_DISABLE:
            return 'disabled project key %s' % (self.data['public_key'],)

        return ''
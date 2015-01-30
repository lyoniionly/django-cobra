from django.contrib import admin

from cobra.core.loading import get_model

AuditLogEntry = get_model('auditlog', 'AuditLogEntry')

class AuditLogEntryAdmin(admin.ModelAdmin):
    list_display = ('event', 'organization', 'actor', 'datetime')
    list_filter = ('event', 'datetime')
    search_fields = ('actor__email', 'organization__name', 'organization__slug')
    raw_id_fields = ('organization', 'actor', 'target_user')

admin.site.register(AuditLogEntry, AuditLogEntryAdmin)
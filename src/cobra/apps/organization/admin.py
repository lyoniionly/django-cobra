from django.contrib import admin
from cobra.core.loading import get_model

Organization = get_model('organization', 'Organization')
OrganizationMember = get_model('organization', 'OrganizationMember')
Team = get_model('team', 'Team')

class OrganizationTeamInline(admin.TabularInline):
    model = Team
    extra = 1
    fields = ('name', 'slug', 'owner', 'status', 'date_added')
    raw_id_fields = ('organization', 'owner')


class OrganizationMemberInline(admin.TabularInline):
    model = OrganizationMember
    extra = 1
    fields = ('user', 'type', 'organization')
    raw_id_fields = ('user', 'organization')


class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'owner', 'status')
    list_filter = ('status',)
    search_fields = ('name', 'owner__username', 'owner__email', 'slug')
    raw_id_fields = ('owner',)
    inlines = (OrganizationMemberInline, OrganizationTeamInline)

admin.site.register(Organization, OrganizationAdmin)

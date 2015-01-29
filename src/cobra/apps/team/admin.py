from django.contrib import admin
from cobra.core.loading import get_model

Project = get_model('project', 'Project')
OrganizationMember = get_model('organization', 'OrganizationMember')
Team = get_model('team', 'Team')

class TeamProjectInline(admin.TabularInline):
    model = Project
    extra = 1
    fields = ('name', 'slug')
    raw_id_fields = ('organization', 'team')


class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'organization', 'status', 'date_added')
    list_filter = ('status',)
    search_fields = ('name', 'organization__name', 'slug')
    raw_id_fields = ('owner', 'organization')
    inlines = (TeamProjectInline,)

    def save_model(self, request, obj, form, change):
        # TODO(dcramer): remove when ownership is irrelevant
        if change:
            obj.owner = obj.organization.owner
        super(TeamAdmin, self).save_model(request, obj, form, change)
        if not change:
            return

        Project.objects.filter(
            team=obj,
        ).update(
            organization=obj.organization,
        )

        # remove invalid team links
        queryset = OrganizationMember.objects.filter(
            teams=obj,
        ).exclude(
            organization=obj.organization,
        )
        for member in queryset:
            member.teams.remove(obj)

admin.site.register(Team, TeamAdmin)
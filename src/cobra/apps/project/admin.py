from django.contrib import admin
from cobra.core.loading import get_model

Project = get_model('project', 'Project')

class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'organization', 'platform', 'status', 'date_added')
    list_filter = ('status', 'platform', 'public')
    search_fields = ('name', 'team__owner__username', 'team__owner__email', 'team__slug',
                     'team__name', 'slug')
    raw_id_fields = ('team', 'organization')

admin.site.register(Project, ProjectAdmin)
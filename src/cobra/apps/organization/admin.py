from django.contrib import admin
from cobra.core.loading import get_model

Organization = get_model('organization', 'Organization')
OrganizationMember = get_model('organization', 'OrganizationMember')


admin.site.register(Organization)
admin.site.register(OrganizationMember)

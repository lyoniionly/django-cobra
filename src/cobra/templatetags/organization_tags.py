from django import template
from cobra.core.loading import get_model

register = template.Library()

Organization = get_model('organization', 'Organization')

@register.filter
def list_organizations(user):
    return Organization.objects.get_for_user(user)
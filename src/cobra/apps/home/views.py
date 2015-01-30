from __future__ import absolute_import
from braces.views import AnonymousRequiredMixin

from django.core.urlresolvers import reverse
from django.views.generic import TemplateView
from cobra.views.generic import OrganizationMixin


class HomeView(AnonymousRequiredMixin, OrganizationMixin, TemplateView):
    """
    This is the home page and will typically live at /
    """
    template_name = 'home/landing.html'

    def get_authenticated_redirect_url(self):
        # TODO(dcramer): deal with case when the user cannot create orgs
        organization = self.get_active_organization(self.request)
        if organization is None:
            url = reverse('organization:create')
        else:
            url = reverse('organization:home', args=[organization.slug])
        return url
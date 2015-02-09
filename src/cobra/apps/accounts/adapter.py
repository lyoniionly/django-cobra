from __future__ import absolute_import

from allauth.account.adapter import DefaultAccountAdapter
from django.core.urlresolvers import reverse


class AccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        """
        We override this method, because we want to use the request.session of _next url.
        The organization member invited will add the _next to the session.
        """
        default = super(AccountAdapter, self).get_login_redirect_url(request)
        login_url = request.session.pop('_next', None) or default
        if '//' in login_url:
            login_url = default
        elif login_url.startswith(reverse('account_login')):
            login_url = default
        return login_url

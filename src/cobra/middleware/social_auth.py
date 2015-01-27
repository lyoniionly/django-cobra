
from __future__ import absolute_import

from django.core.urlresolvers import reverse
from social_auth.middleware import SocialAuthExceptionMiddleware

from cobra.core.http import absolute_uri


class CobraSocialAuthExceptionMiddleware(SocialAuthExceptionMiddleware):
    def get_redirect_uri(self, request, exception):
        return absolute_uri(reverse('customer:login'))

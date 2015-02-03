
from __future__ import absolute_import

import pytz

from django.conf import settings
from django.core.urlresolvers import reverse

from cobra.singleton import env
from cobra.core.safe import safe_execute
from cobra.core.loading import get_model

UserOption = get_model('option', 'UserOption')


class CobraLocaleMiddleware(object):
    def process_request(self, request):
        # HACK: bootstrap some env crud if we haven't yet
        if not settings.COBRA_URL_PREFIX:
            settings.COBRA_URL_PREFIX = request.build_absolute_uri(reverse('home:home')).strip('/')

        # bind request to env
        env.request = request

        safe_execute(self.load_user_conf, request)

    def load_user_conf(self, request):
        if settings.MAINTENANCE:
            return

        if not request.user.is_authenticated():
            return

        language = UserOption.objects.get_value(
            user=request.user, project=None, key='language', default=None)
        if language:
            request.session['django_language'] = language

        timezone = UserOption.objects.get_value(
            user=request.user, project=None, key='timezone', default=None)
        if timezone:
            request.timezone = pytz.timezone(timezone)

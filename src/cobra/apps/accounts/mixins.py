import logging

from django.conf import settings
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.sites.models import get_current_site

from cobra.core.loading import get_model, get_class
from cobra.apps.accounts.signals import user_registered
from cobra.core.compat import get_user_model

User = get_user_model()
CommunicationEventType = None #get_model('accounts', 'CommunicationEventType')
Dispatcher = get_class('accounts.utils', 'Dispatcher')

logger = logging.getLogger('cobra.accounts')



class RegisterUserMixin(object):
    communication_type_code = 'REGISTRATION'

    def register_user(self, form):
        """
        Create a user instance and send a new registration email (if configured
        to).
        """
        user = form.save()

        # Raise signal robustly (we don't want exceptions to crash the request
        # handling).
        user_registered.send_robust(
            sender=self, request=self.request, user=user)

        if getattr(settings, 'COBRA_SEND_REGISTRATION_EMAIL', True):
            self.send_registration_email(user)

        # We have to authenticate before login
        try:
            user = authenticate(
                username=user.email,
                password=form.cleaned_data['password1'])
        except User.MultipleObjectsReturned:
            # Handle race condition where the registration request is made
            # multiple times in quick succession.  This leads to both requests
            # passing the uniqueness check and creating users (as the first one
            # hasn't committed when the second one runs the check).  We retain
            # the first one and deactivate the dupes.
            logger.warning(
                'Multiple users with identical email address and password'
                'were found. Marking all but one as not active.')
            # As this section explicitly deals with the form being submitted
            # twice, this is about the only place in Oscar where we don't
            # ignore capitalisation when looking up an email address.
            # We might otherwise accidentally mark unrelated users as inactive
            users = User.objects.filter(email=user.email)
            user = users[0]
            for u in users[1:]:
                u.is_active = False
                u.save()

        auth_login(self.request, user)

        return user

    def send_registration_email(self, user):
        code = self.communication_type_code
        ctx = {'user': user,
               'site': get_current_site(self.request)}
        messages = CommunicationEventType.objects.get_and_render(
            code, ctx)
        if messages and messages['body']:
            Dispatcher().dispatch_user_messages(user, messages)

from django.shortcuts import get_object_or_404, redirect
from django.views import generic
from django.core.urlresolvers import reverse, reverse_lazy
from django.core.exceptions import ObjectDoesNotExist
from django import http
from django.contrib import messages
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth import logout as auth_logout, login as auth_login
from django.contrib.sites.models import get_current_site
from django.conf import settings

from cobra.core.utils import safe_referrer
from cobra.views.generic import PostActionMixin, PageTitleMixin
from cobra.core.loading import (
    get_class, get_profile_class, get_classes, get_model)
from cobra.core.compat import get_user_model

ProfileForm = get_class(
    'accounts.forms', 'ProfileForm')

User = get_user_model()


# =============
# Profile
# =============

class ProfileUpdateView(PageTitleMixin, generic.FormView):
    form_class = ProfileForm
    template_name = 'accounts/profile_form.html'
    page_title = _('Your Profile')
    active_tab = 'profile'
    success_url = reverse_lazy('accounts:profile-update')

    def get_form_kwargs(self):
        kwargs = super(ProfileUpdateView, self).get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs

    def form_valid(self, form):
        # Grab current user instance before we save form.  We may need this to
        # send a warning email if the email address is changed.
        try:
            old_user = User.objects.get(id=self.request.user.id)
        except User.DoesNotExist:
            old_user = None

        form.save()

        # We have to look up the email address from the form's
        # cleaned data because the object created by form.save() can
        # either be a user or profile instance depending whether a profile
        # class has been specified by the AUTH_PROFILE_MODULE setting.
        new_email = form.cleaned_data['email']
        if old_user and new_email != old_user.email:
            # Email address has changed - send a confirmation email to the old
            # address including a password reset link in case this is a
            # suspicious change.
            # ctx = {
            #     'user': self.request.user,
            #     'site': get_current_site(self.request),
            #     'reset_url': get_password_reset_url(old_user),
            #     'new_email': new_email,
            # }
            # msgs = CommunicationEventType.objects.get_and_render(
            #     code=self.communication_type_code, context=ctx)
            # Dispatcher().dispatch_user_messages(old_user, msgs)
            pass

        messages.success(self.request, _("Profile updated"))
        return redirect(self.get_success_url())



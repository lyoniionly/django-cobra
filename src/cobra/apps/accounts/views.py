from django.shortcuts import redirect
from django.views import generic
from django.core.urlresolvers import reverse_lazy
from django.contrib import messages
from django.utils.translation import ugettext_lazy as _
from django.conf import settings

from cobra.views.mixins import PageTitleMixin
from cobra.core.loading import (
    get_class, get_profile_class, get_classes, get_model)
from cobra.core.compat import get_user_model

ProfileForm, AppearanceSettingsForm = get_classes(
    'accounts.forms', ['ProfileForm', 'AppearanceSettingsForm'])

User = get_user_model()
UserOption = get_model('option', 'UserOption')


# =============
# Profile
# =============

class ProfileSettingsView(PageTitleMixin, generic.FormView):
    form_class = ProfileForm
    template_name = 'accounts/profile_settings.html'
    page_title = _('Your Profile')
    active_tab = 'profile'
    success_url = reverse_lazy('accounts:profile-settings')

    def get_form_kwargs(self):
        kwargs = super(ProfileSettingsView, self).get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs

    def form_valid(self, form):
        # Grab current user instance before we save form.  We may need this to
        # send a warning email if the email address is changed.
        # try:
        #     old_user = User.objects.get(id=self.request.user.id)
        # except User.DoesNotExist:
        #     old_user = None

        form.save()

        messages.success(self.request, _("Profile updated successfully"))
        return redirect(self.get_success_url())


# =============
# Appearance
# =============

class AppearanceSettingsView(PageTitleMixin, generic.FormView):
    form_class = AppearanceSettingsForm
    template_name = 'accounts/appearance_settings.html'
    page_title = _('Appearance')
    active_tab = 'appearance'
    success_url = reverse_lazy('accounts:appearance-settings')

    def get_form_kwargs(self):
        kwargs = super(AppearanceSettingsView, self).get_form_kwargs()
        options = UserOption.objects.get_all_values(user=self.request.user, project=None)
        kwargs['user'] = self.request.user
        kwargs['initial'] = {
            'language': options.get('language') or self.request.LANGUAGE_CODE,
            'timezone': options.get('timezone') or settings.TIME_ZONE
        }
        return kwargs

    def form_valid(self, form):
        form.save()
        messages.success(self.request, _("Appearance updated successfully"))
        return redirect(self.get_success_url())
from django.conf.urls import url
from django.contrib.auth.decorators import login_required

from allauth.account import views as allauth_views

from cobra.core.application import Application
from cobra.core.loading import get_class


class AccountsApplication(Application):
    name = 'accounts'

    # email_list_view = get_class('accounts.views', 'EmailHistoryView')
    # email_detail_view = get_class('accounts.views', 'EmailDetailView')
    # login_view = get_class('accounts.views', 'AccountAuthView')
    # logout_view = get_class('accounts.views', 'LogoutView')
    # register_view = get_class('accounts.views', 'AccountRegistrationView')
    # profile_view = get_class('accounts.views', 'ProfileView')
    # profile_update_view = get_class('accounts.views', 'ProfileUpdateView')
    # profile_delete_view = get_class('accounts.views', 'ProfileDeleteView')
    # change_password_view = get_class('accounts.views', 'ChangePasswordView')

    profile_settings_view = get_class('accounts.views', 'ProfileSettingsView')
    appearance_settings_view = get_class('accounts.views', 'AppearanceSettingsView')


    def get_urls(self):
        urls = [
            url(r'^settings/profile/$', login_required(self.profile_settings_view.as_view()), name='profile-settings'),
            url(r'^settings/appearance/$', login_required(self.appearance_settings_view.as_view()), name='appearance-settings'),

            # Copy from django-allauth, we want to unify the url of accounts settings.
            url(r"^settings/password/$", allauth_views.password_change, name="password-settings"),
            # E-mail
            url(r"^settings/emails/$", allauth_views.email, name="emails-settings"),
        ]

        return self.post_process_urls(urls)


application = AccountsApplication()

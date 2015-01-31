from django.conf.urls import url
from django.contrib.auth.decorators import login_required

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


    def get_urls(self):
        urls = [
            # Login, logout and register doesn't require login
            # url(r'^login/$', self.login_view.as_view(), name='login'),
            # url(r'^logout/$', self.logout_view.as_view(), name='logout'),
            # url(r'^register/$', self.register_view.as_view(), name='register'),
            # url(r'^change-password/$',
            #     login_required(self.change_password_view.as_view()),
            #     name='change-password'),
            #
            # # Profile
            # url(r'^profile/$',
            #     login_required(self.profile_view.as_view()),
            #     name='profile-view'),
            # url(r'^profile/edit/$',
            #     login_required(self.profile_update_view.as_view()),
            #     name='profile-update'),
            # url(r'^profile/delete/$',
            #     login_required(self.profile_delete_view.as_view()),
            #     name='profile-delete'),

            # Email history
            # url(r'^emails/$',
            #     login_required(self.email_list_view.as_view()),
            #     name='email-list'),
            # url(r'^emails/(?P<email_id>\d+)/$',
            #     login_required(self.email_detail_view.as_view()),
            #     name='email-detail'),

        ]

        return self.post_process_urls(urls)


application = AccountsApplication()

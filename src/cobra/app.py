# flake8: noqa, because URL syntax is more readable with long lines

import django
from django.conf.urls import url, include
from django.contrib.auth import views as auth_views
from django.core.urlresolvers import reverse_lazy

from cobra.core.application import Application
from cobra.core.loading import get_class
from cobra.views.decorators import login_forbidden


class Frame(Application):
    name = None

    # catalogue_app = get_class('catalogue.app', 'application')
    home_app = get_class('home.app', 'application')
    accounts_app = get_class('accounts.app', 'application')
    organization_app = get_class('organization.app', 'application')
    team_app = get_class('team.app', 'application')
    project_app = get_class('project.app', 'application')
    svnkit_app = get_class('svnkit.app', 'application')
    auditlog_app = get_class('auditlog.app', 'application')
    # basket_app = get_class('basket.app', 'application')
    # checkout_app = get_class('checkout.app', 'application')
    # promotions_app = get_class('promotions.app', 'application')
    # search_app = get_class('search.app', 'application')
    dashboard_app = get_class('dashboard.app', 'application')
    share_app = get_class('share.app', 'application')
    menu_app = get_class('menu.app', 'application')

    # password_reset_form = get_class('accounts.forms', 'PasswordResetForm')
    # set_password_form = get_class('accounts.forms', 'SetPasswordForm')

    def get_urls(self):
        urls = [
            # url(r'^catalogue/', include(self.catalogue_app.urls)),
            # url(r'^basket/', include(self.basket_app.urls)),
            # url(r'^checkout/', include(self.checkout_app.urls)),
            url(r'^accounts/', include(self.accounts_app.urls)),
            url(r'^organizations/', include(self.organization_app.urls)),
            url(r'^teams/', include(self.team_app.urls)),
            url(r'^projects/', include(self.project_app.urls)),
            url(r'^svn/', include(self.svnkit_app.urls)),
            url(r'^audit-log/', include(self.auditlog_app.urls)),
            # url(r'^search/', include(self.search_app.urls)),
            url(r'^dashboard/', include(self.dashboard_app.urls)),
            url(r'^share/', include(self.share_app.urls)),
            url(r'^menu/', include(self.menu_app.urls)),

            # Password reset - as we're using Django's default view functions,
            # we can't namespace these urls as that prevents
            # the reverse function from working.
            # url(r'^password-reset/$',
            #     login_forbidden(auth_views.password_reset),
            #     {'password_reset_form': self.password_reset_form,
            #      'post_reset_redirect': reverse_lazy('password-reset-done')},
            #     name='password-reset'),
            # url(r'^password-reset/done/$',
            #     login_forbidden(auth_views.password_reset_done),
            #     name='password-reset-done')
        ]

        # Django <=1.5: uses uidb36 to encode the user's primary key (support
        #               has been removed)
        # Django 1.6:   uses uidb64 to encode the user's primary key, but
        #               supports legacy links
        # Django > 1.7: used uidb64 to encode the user's primary key
        # see https://docs.djangoproject.com/en/dev/releases/1.6/#django-contrib-auth-password-reset-uses-base-64-encoding-of-user-pk
        # urls.append(
        #     url(r'^password-reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>.+)/$',
        #         login_forbidden(auth_views.password_reset_confirm),
        #         {
        #             'post_reset_redirect': reverse_lazy('password-reset-complete'),
        #             'set_password_form': self.set_password_form,
        #         },
        #         name='password-reset-confirm'))
        # if django.VERSION < (1, 7):
        #     urls.append(
        #         url(r'^password-reset/confirm/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$',
        #             login_forbidden(auth_views.password_reset_confirm_uidb36),
        #             {
        #                 'post_reset_redirect': reverse_lazy('password-reset-complete'),
        #                 'set_password_form': self.set_password_form,
        #             }))

        urls += [
            # url(r'^password-reset/complete/$',
            #     login_forbidden(auth_views.password_reset_complete),
            #     name='password-reset-complete'),
            # url(r'', include(self.promotions_app.urls)),
            url(r'', include(self.home_app.urls)),
            url(r'^auth/', include('allauth.urls')),
            url(r'^accounts/sudo/$', 'sudo.views.sudo',
                {'template_name': 'accounts/sudo.html'},
                name='sudo'),
        ]
        return urls


# 'frame' kept for legacy projects - 'application' is a better name
frame = application = Frame()

from django.conf.urls import url, include
from django.contrib.auth.decorators import login_required

from cobra.core.application import Application
from cobra.core.loading import get_class


class OrganizationApplication(Application):
    name = 'organization'
    organization_home_view = get_class('organization.views', 'OrganizationHomeView')
    organization_create_view = get_class('organization.views', 'OrganizationCreateView')
    organization_settings_view = get_class('organization.views', 'OrganizationSettingsView')
    organization_remove_view = get_class('organization.views', 'OrganizationRemoveView')

    organization_members_view = get_class('organization.views', 'OrganizationMembersView')
    organization_member_create_view = get_class('organization.views', 'OrganizationMemberCreateView')
    organization_member_settings_view = get_class('organization.views', 'OrganizationMemberSettingsView')
    organization_member_accept_view = get_class('organization.views', 'OrganizationMemberAcceptView')
    # organization_member_create_view = get_class('organization.views', 'OrganizationMemberCreateView')

    organization_my_list_view = get_class('organization.views', 'OrganizationMyListView')
    organization_all_list_view = get_class('organization.views', 'OrganizationAllListView')
    organization_join_view = get_class('organization.views', 'OrganizationJoinView')

    project_app = get_class('organization.project.app', 'application')

    workreport_app = get_class('organization.workreport.app', 'application')

    def get_urls(self):
        urls = [
            url(r'^(?P<organization_slug>(?!create)[\w_-]+)/$', self.organization_home_view.as_view(),
                name='home'),

            url(r'^create/$', self.organization_create_view.as_view(),
                name='create'),

            url(r'^(?P<organization_slug>[\w_-]+)/settings/$', self.organization_settings_view.as_view(),
                name='settings'),
            url(r'^(?P<organization_slug>[\w_-]+)/remove/$', self.organization_remove_view.as_view(),
                name='remove'),

            url(r'^(?P<organization_slug>[\w_-]+)/members/$', self.organization_members_view.as_view(),
                name='members'),
            url(r'^(?P<organization_slug>[\w_-]+)/members/create/$', self.organization_member_create_view.as_view(),
                name='member-create'),
            url(r'^(?P<organization_slug>[\w_-]+)/members/(?P<member_id>\d+)/$', self.organization_member_settings_view.as_view(),
                name='member-settings'),

            url(r'^accept/(?P<member_id>\d+)/(?P<token>\w+)/$', self.organization_member_accept_view.as_view(),
                name='member-accept'),
            # url(r'^(?P<organization_slug>[\w_-]+)/members/new/$', self.organization_member_create_view.as_view(),
            #     name='member-create'),

            url(r'^(?P<organization_slug>[\w_-]+)/project/', include(self.project_app.urls)),
            url(r'^(?P<organization_slug>[\w_-]+)/workreport/', include(self.workreport_app.urls)),

            url(r'^my/list/$', login_required(self.organization_my_list_view.as_view()),
                name='my-list'),
            url(r'^all/list/$', self.organization_all_list_view.as_view(),
                name='all-list'),

            url(r'^(?P<organization_slug>[\w_-]+)/join/$', self.organization_join_view.as_view(),
                name='join'),



        ]
        return self.post_process_urls(urls)


application = OrganizationApplication()

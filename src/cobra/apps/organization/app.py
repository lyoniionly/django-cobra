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
    summary_app = get_class('organization.summary.app', 'application')

    # ajax
    organization_members_subordinates_view = get_class('organization.ajax', 'OrganizationMembersSubordinatesView')
    organization_search_suggestion_view = get_class('organization.ajax', 'OrganizationSearchSuggestionView')

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
            url(r'^(?P<organization_slug>[\w_-]+)/summary/', include(self.summary_app.urls)),

            url(r'^my/list/$', login_required(self.organization_my_list_view.as_view()),
                name='my-list'),
            url(r'^all/list/$', self.organization_all_list_view.as_view(),
                name='all-list'),

            url(r'^(?P<organization_slug>[\w_-]+)/join/$', self.organization_join_view.as_view(),
                name='join'),

            # ajax
            url(r'^(?P<organization_slug>[\w_-]+)/users/workreportSubordinates/(?P<user_id>\d+).json$', self.organization_members_subordinates_view.as_view(),
                name='ajax-members-subordinates'),
            url(r'^(?P<organization_slug>[\w_-]+)/search/suggestion.json$', self.organization_search_suggestion_view.as_view(),
                name='ajax-search-suggestion'),

        ]
        return self.post_process_urls(urls)


application = OrganizationApplication()

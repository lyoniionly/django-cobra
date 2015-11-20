from django.conf.urls import url, include

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
        ]
        return self.post_process_urls(urls)


application = OrganizationApplication()

from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class OrganizationApplication(Application):
    name = 'organization'
    organization_home_view = get_class('organization.views', 'OrganizationHomeView')
    organization_create_view = get_class('organization.views', 'OrganizationCreateView')
    organization_settings_view = get_class('organization.views', 'OrganizationSettingsView')
    organization_remove_view = get_class('organization.views', 'OrganizationRemoveView')

    organization_members_view = get_class('organization.views', 'OrganizationMembersView')
    organization_member_settings_view = get_class('organization.views', 'OrganizationMemberSettingsView')
    # organization_member_create_view = get_class('organization.views', 'OrganizationMemberCreateView')

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
            url(r'^(?P<organization_slug>[\w_-]+)/members/(?P<member_id>\d+)/$', self.organization_member_settings_view.as_view(),
                name='member-settings'),
            # url(r'^(?P<organization_slug>[\w_-]+)/members/new/$', self.organization_member_create_view.as_view(),
            #     name='member-create'),
        ]
        return self.post_process_urls(urls)


application = OrganizationApplication()

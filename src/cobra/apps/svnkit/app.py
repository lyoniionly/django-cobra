from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class SvnkitApplication(Application):
    name = 'svnkit'

    svn_node_view = get_class('svnkit.views', 'SvnNodeView')
    svn_changeset_list_view = get_class('svnkit.views', 'SvnChangesetListView')
    svn_changeset_view = get_class('svnkit.views', 'SvnChangesetView')
    svn_content_view = get_class('svnkit.views', 'SvnContentView')
    svn_node_diff_view = get_class('svnkit.views', 'SvnNodeDiffView')

    def get_urls(self):
        urls = [
            # url(r'^$', self.svn_repository_list_view.as_view(),
            #     name='repository_list'),

            url(r'^(?P<organization_slug>[\w_-]+)/(?P<project_id>[\w_-]+):c(?P<content_id>[0-9]+)/(?P<path>.+)$', self.svn_content_view.as_view(),
                name='content'),

            url(r'^(?P<organization_slug>[\w_-]+)/(?P<project_id>[\w_-]+)$', self.svn_changeset_list_view.as_view(),
                name='changeset-list'),

            # url(r'^(?P<organization_slug>[\w_-]+)/(?P<project_id>[\w_-]+):diff$', self.svn_repository_diff_view.as_view(),
            #     name='repository-diff'),

            url(r'^(?P<organization_slug>[\w_-]+)/(?P<project_id>[\w_-]+):r(?P<revision>[0-9]+)$', self.svn_changeset_view.as_view(),
                name='changeset'),

            url(r'^(?P<organization_slug>[\w_-]+)/(?P<project_id>[\w_-]+):r(?P<from_revision>[0-9]+)-r(?P<to_revision>[0-9]+)(?P<path>/.*)$', self.svn_node_diff_view.as_view(),
                name='node-diff'),

            url(r'^(?P<organization_slug>[\w_-]+)/(?P<project_id>[\w_-]+):r(?P<revision>[0-9]+)(?P<path>/.*)$', self.svn_node_view.as_view(),
                name='node-revision'),

            url(r'^(?P<organization_slug>[\w_-]+)/(?P<project_id>[\w_-]+)(?P<path>/.*)$', self.svn_node_view.as_view(), {'revision': None},
                name='node'),
        ]
        return self.post_process_urls(urls)


application = SvnkitApplication()

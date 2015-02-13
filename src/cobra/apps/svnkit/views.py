from __future__ import absolute_import

import posixpath

from django import http, shortcuts, template
from django.core.urlresolvers import reverse
from django.utils.decorators import method_decorator
from django.views import generic

from cobra.core.decorators import has_access
from cobra.core.loading import get_model

from . import exceptions
from .decorators import autosync_repositories
from cobra.views.mixins import ExtraContextMixin


Repository = get_model('svnkit', 'Repository')
Changeset = get_model('svnkit', 'Changeset')

class SvnNodeView(ExtraContextMixin, generic.TemplateView):

    @method_decorator(has_access)
    @method_decorator(autosync_repositories)
    def dispatch(self, request, *args, **kwargs):
        return super(SvnNodeView, self).dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        r = request.POST.get('revision', '').lower()
        if r.startswith('r'):
            r = r[1:]
        if r.isdigit():
            return http.HttpResponseRedirect(reverse(
                'svnkit:node-revision',
                args=(kwargs['organization'].slug, kwargs['project'].slug, r, self.kwargs.get('path'))))

    def get(self, request, *args, **kwargs):
        self.organization = kwargs.get('organization')
        self.project = kwargs.get('project')
        self.repository = self.get_repository()
        self.revision = self.kwargs.get('revision') or self.repository.get_latest_revision()
        self.changeset = shortcuts.get_object_or_404(Changeset, repository=self.repository, revision=self.revision)
        self.path = self.kwargs.get('path') or posixpath.sep
        try:
            self.node = self.repository.get_node(self.path, self.revision)
        except exceptions.InvalidNode:
            self.node = None
        return super(SvnNodeView, self).get(request, *args, **kwargs)

    def get_repository(self):
        repository_lookup = {'project': self.project}
        repository = shortcuts.get_object_or_404(
            Repository, **repository_lookup)
        return repository

    def get_context_data(self, **kwargs):
        ctx = {}
        ctx.update(kwargs)
        ctx['organization'] = self.organization
        ctx['team'] = self.project.team
        ctx['project'] = self.project
        ctx['repository'] = self.repository
        ctx['revision'] = self.revision
        ctx['changeset'] = self.changeset
        ctx['path'] = self.path
        ctx['node'] = self.node
        return super(SvnNodeView, self).get_context_data(**ctx)

    def get_template_names(self):
        if not self.node:
            return 'svnkit/node_invalid.html'

        if self.node.is_directory():
            return 'svnkit/node_directory.html'
        else:
            return 'svnkit/node_file.html'

def node(request, repository_label, revision, path):
    """A view for displaying a given path at a given revision."""
    if request.method == 'POST':
        r = request.POST.get('revision', '').lower()
        if r.startswith('r'):
            r = r[1:]
        if r.isdigit():
            return http.HttpResponseRedirect(reverse(
                'svnlit_node_revision', args=(repository_label, r, path)))

    # repository_lookup = {'label': repository_label}
    # if not request.user.is_authenticated():
    #     repository_lookup['is_private'] = False
    # repository = shortcuts.get_object_or_404(
    #     Repository, **repository_lookup)
    # if not revision:
    #     revision = repository.get_latest_revision()
    # changeset = shortcuts.get_object_or_404(
    #     Changeset, repository=repository, revision=revision)

    # if not path:
    #     path = posixpath.sep

#     try:
#         node = repository.get_node(path, revision)
#     except exceptions.InvalidNode:
#         return shortcuts.render_to_response(
#             'svnlit/node_invalid.html', locals(),
#             context_instance=template.RequestContext(request))
#
#     if node.is_directory():
#         return shortcuts.render_to_response(
#             'svnlit/node_directory.html', locals(),
#             context_instance=template.RequestContext(request))
#     else:
#         return shortcuts.render_to_response(
#             'svnlit/node_file.html', locals(),
#             context_instance=template.RequestContext(request))
#
# node = decorators.autosync_repositories(node)
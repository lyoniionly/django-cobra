from __future__ import absolute_import

import posixpath

from django import http, shortcuts, template
from django.conf import settings
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


class SvnChangesetListView(ExtraContextMixin, generic.ListView):
    context_object_name = "changesets"
    template_name = 'svnkit/changeset_list.html'
    paginate_by = settings.COBRA_SVNKIT_CHANGESETS_PER_PAGE

    @method_decorator(has_access)
    @method_decorator(autosync_repositories)
    def dispatch(self, request, *args, **kwargs):
        self.organization = kwargs.get('organization')
        self.project = kwargs.get('project')
        self.repository = self.get_repository()
        return super(SvnChangesetListView, self).dispatch(request, *args, **kwargs)

    def get_repository(self):
        repository_lookup = {'project': self.project}
        repository = shortcuts.get_object_or_404(
            Repository, **repository_lookup)
        return repository

    def get_queryset(self):
        return self.repository.changesets.all()


class SvnChangesetView(ExtraContextMixin, generic.DetailView):

    context_object_name = "changeset"
    template_name = 'svnkit/changeset.html'

    @method_decorator(has_access)
    @method_decorator(autosync_repositories)
    def dispatch(self, request, *args, **kwargs):
        self.organization = kwargs.get('organization')
        self.project = kwargs.get('project')
        self.repository = self.get_repository()
        return super(SvnChangesetView, self).dispatch(request, *args, **kwargs)

    def get_object(self, queryset=None):
        if hasattr(self, 'object'):
            return self.object
        else:
            self.revision = self.kwargs.get('revision') or self.repository.get_latest_revision()
            changeset = shortcuts.get_object_or_404(Changeset, repository=self.repository, revision=self.revision)
            return changeset

    def get_repository(self):
        repository_lookup = {'project': self.project}
        repository = shortcuts.get_object_or_404(
            Repository, **repository_lookup)
        return repository

    def get_context_data(self, **kwargs):
        ctx = {}
        ctx.update(kwargs)
        ctx['revision'] = self.revision
        return super(SvnChangesetView, self).get_context_data(**ctx)


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


class SvnContentView(generic.TemplateView):
    pass
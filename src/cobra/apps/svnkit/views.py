from __future__ import absolute_import, division

import posixpath

from django import http, shortcuts, template
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.urlresolvers import reverse
from django.utils.decorators import method_decorator
from django.views import generic
from django_downloadview import VirtualDownloadView

from cobra.core.decorators import has_access
from cobra.core.loading import get_model
from cobra.views.mixins import ExtraContextMixin

from . import exceptions
from .decorators import autosync_repositories
from .markup.hightlighter import get_lexer
from .utils import diff

Repository = get_model('svnkit', 'Repository')
Changeset = get_model('svnkit', 'Changeset')
Content = get_model('svnkit', 'Content')


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


class SvnContentView(VirtualDownloadView):
    @method_decorator(has_access)
    @method_decorator(autosync_repositories)
    def dispatch(self, request, *args, **kwargs):
        self.organization = kwargs.get('organization')
        self.project = kwargs.get('project')
        self.repository = self.get_repository()
        return super(SvnContentView, self).dispatch(request, *args, **kwargs)

    def get_repository(self):
        repository_lookup = {'project': self.project}
        repository = shortcuts.get_object_or_404(
            Repository, **repository_lookup)
        return repository

    def get_file(self):
        """Return :class:`django.core.files.base.ContentFile` object."""
        content = shortcuts.get_object_or_404(Content, pk=self.kwargs['content_id'])
        return ContentFile(content.get_data(), name=self.kwargs['path'])


class SvnNodeDiffView(ExtraContextMixin, generic.TemplateView):
    """View a diff of two revisions at a node."""
    template_name = 'svnkit/node_diff.html'

    @method_decorator(has_access)
    @method_decorator(autosync_repositories)
    def dispatch(self, request, *args, **kwargs):
        self.organization = kwargs.get('organization')
        self.project = kwargs.get('project')
        self.repository = self.get_repository()
        return super(SvnNodeDiffView, self).dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        self.path = self.kwargs['path']
        self.from_changeset = shortcuts.get_object_or_404(
            Changeset, repository=self.repository, revision=self.kwargs['from_revision'])
        self.to_changeset = shortcuts.get_object_or_404(
            Changeset, repository=self.repository, revision=self.kwargs['to_revision'])

        try:
            self.from_node = self.repository.get_node(self.kwargs['path'], self.kwargs['from_revision'])
        except exceptions.InvalidNode:
            self.revision = self.kwargs['from_revision']
            self.template_name =  'svnkit/node_invalid.html'
            return super(SvnNodeDiffView, self).get(request, *args, **kwargs)

        try:
            self.to_node = self.repository.get_node(self.kwargs['path'], self.kwargs['to_revision'])
        except exceptions.InvalidNode:
            self.revision = self.kwargs['to_revision']
            self.template_name =  'svnkit/node_invalid.html'
            return super(SvnNodeDiffView, self).get(request, *args, **kwargs)

        if not (self.from_node.is_file() and self.to_node.is_file()):
            raise http.Http404('Invalid node type for diff.')

        if self.from_node.content.is_binary() or self.to_node.content.is_binary():
            raise http.Http404('Cannot diff binary nodes.')

        try:
            content_from = self.from_node.content.get_data().decode('utf-8')
        except UnicodeDecodeError:
            content_from = self.from_node.content.get_data().decode('gbk')

        try:
            content_to = self.to_node.content.get_data().decode('utf-8')
        except UnicodeDecodeError:
            content_to = self.to_node.content.get_data().decode('gbk')

        self.diff_data, self.addition_num, self.deletion_num = diff.diff_lines(
            content_from,
            content_to, self.from_node.get_basename())
        self.addition_stats, self.deletion_stats, self.nil_stats = self._calc_diffstas(self.addition_num, self.deletion_num)
        return super(SvnNodeDiffView, self).get(request, *args, **kwargs)

    def _calc_diffstas(self, addition_num, deletion_num):
        total = addition_num + deletion_num
        if total<=5:
            return (range(addition_num), range(deletion_num), range(5-total))
        else:
            addition = int((addition_num / total)*5)
            deletion = int((deletion_num / total)*5)
            return (range(addition), range(deletion), range(5-addition+deletion))

    def get_repository(self):
        repository_lookup = {'project': self.project}
        repository = shortcuts.get_object_or_404(
            Repository, **repository_lookup)
        return repository

    def get_context_data(self, **kwargs):
        ctx = {}
        ctx.update(kwargs)
        ctx['revision'] = getattr(self, 'revision', None)
        ctx['path'] = getattr(self, 'path', None)
        ctx['from_changeset'] = self.from_changeset
        ctx['to_changeset'] = self.to_changeset
        ctx['from_node'] = getattr(self, 'from_node', None)
        ctx['to_node'] = getattr(self, 'to_node', None)
        ctx['diff_data'] = getattr(self, 'diff_data', None)
        ctx['addition_num'] = getattr(self, 'addition_num', None)
        ctx['deletion_num'] = getattr(self, 'deletion_num', None)
        ctx['addition_stats'] = getattr(self, 'addition_stats', None)
        ctx['deletion_stats'] = getattr(self, 'deletion_stats', None)
        ctx['nil_stats'] = getattr(self, 'nil_stats', None)
        return super(SvnNodeDiffView, self).get_context_data(**ctx)
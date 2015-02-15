from __future__ import absolute_import, print_function

from hashlib import md5
import logging
import datetime
import mimetypes
import posixpath
from django.conf import settings

from django.core.exceptions import ImproperlyConfigured
from django.core.urlresolvers import reverse
from django.db import models
from django.db.models import Q
from django.db import transaction
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone
import pysvn

from cobra.core.compat import AUTH_USER_MODEL
from cobra.models import Model
from cobra.models import fields
from cobra.models import sane_repr
from cobra.models.utils import slugify_instance
from cobra.core.http import absolute_uri
from cobra.core.constants import MEMBER_TYPES, MEMBER_USER
from cobra.core.loading import get_class, get_model
from cobra.core.strings import strip, truncatechars

from . import choices
from .exceptions import map_svn_exceptions
from .markup.hightlighter import make_html, get_lexer
from .utils.binaryornot import get_starting_chunk
from .utils.binaryornot import is_binary_string

NodeManager = get_class('svnkit.managers', 'NodeManager')


@python_2_unicode_compatible
class AbstractRepository(Model):
    """
    Meta data for a subversion repository.
    """
    project = models.OneToOneField('project.Project')
    uuid = models.CharField(max_length=128, editable=False)
    root = models.CharField(
        help_text=_('Example: svn://example.com or file:///svn/ or http://host:port'),
        max_length=512)
    prefix = models.CharField(
        help_text=_('<strong class="text-danger">Important!</strong> You maybe meet this situation, the svn url you supply is not the '
                    'root of the repository, and you do not have the right permission '
                    'to access the real root of repository, input a right prefix of '
                    'repository, we will replace it for you automatic.<br><strong class="text-danger">If you do not have this problem, please ignore the attention.</strong>'),
        max_length=512, blank=True)
    uri = models.CharField(
        help_text=_('Externally facing URI for the repository, if available'),
        max_length=512, blank=True)
    is_private = models.BooleanField(default=False)

    username = models.CharField(max_length=512, blank=True)
    password = models.CharField(max_length=512, blank=True)

    last_synced = models.DateTimeField(
        # default=datetime.datetime.fromtimestamp(0, timezone.utc),
        default=datetime.datetime.fromtimestamp(0),
        editable=False)

    class Meta:
        abstract = True
        app_label = 'svnkit'
        db_table = 'cobra_svn_repository'
        verbose_name_plural = _('repositories')

    __repr__ = sane_repr('project_id', 'root')

    def __str__(self):
        return '%s (%s)' % (self.project.name, self.root)

    def _get_login(self, realm, username, may_save):
        if not (self.username and self.password):
            raise ImproperlyConfigured(_(
                'repository requires authentication, '
                'but no username and password available'))
        return (True, self.username, self.password, True)

    def get_svn_client(self):
        """
        Return a subversion client for this repository. The
        authentication information stored with the repository is bound
        with the client. The client can be instantiated with a
        subversion config file with the COBRA_SVNKIT_SVN_CONFIG_PATH
        settings variable.
        """
        if settings.COBRA_SVNKIT_SVN_CONFIG_PATH is not None:
            client = pysvn.Client(settings.COBRA_SVNKIT_SVN_CONFIG_PATH)
        else:
            client = pysvn.Client()

        # set the exceptions to be more granular
        client.exception_style = 1

        # hook for cancelling an api call thats taking too long
        started_dt = datetime.datetime.now()
        def _cancel():
            current_dt = datetime.datetime.now()
            delta = (current_dt - started_dt).seconds
            if delta > settings.COBRA_SVNKIT_CLIENT_TIMEOUT:
                return True
            return False
        client.callback_cancel = _cancel

        # bind the username and password that might be stored with the
        # repository model object in case a login is required.
        client.callback_get_login = self._get_login

        return client

    def sync(self):
        """
        Update the model object representations of the given repository.

        If the UUID has not been obtained for a repository, it is
        obtained from the api. New changesets committed to the
        repository, since the last time the repository was synced, are
        also collected. If no previous sync has been run, all
        changesets are collected.
        """
        self.last_synced = datetime.datetime.now()

        if not self.uuid:
            self.sync_uuid()
        self.sync_changesets()

        self.save()

    # @map_svn_exceptions
    def sync_uuid(self):
        """Get the UUID of the given repository."""
        c = self.get_svn_client()
        info = c.info2(self.root, recurse=False)
        self.uuid = info[0][1]['repos_UUID']
    sync_uuid = map_svn_exceptions(sync_uuid)

    def sync_changesets(self):
        """
        Get new changesets committed to the repository since the last
        time they were collected.
        """
        Changeset = get_model('svnkit', 'Changeset')
        Change = get_model('svnkit', 'Change')
        revision = self.get_latest_revision()

        c = self.get_svn_client()
        log = c.log(
            self.root,
            revision_end=pysvn.Revision(
            pysvn.opt_revision_kind.number, revision),
            discover_changed_paths=True)

        for item in log:
            # ignore the overlap, the changeset is already stored locally
            if item['revision'].number == revision:
                continue

            changeset = Changeset.objects.create(
                repository=self,
                date=datetime.datetime.fromtimestamp(item['date']),
                revision=item['revision'].number,
                author=item.get('author', ''),
                message=item.get('message', '') # Normally, message must be exist, but I meet some condition that there is no message.
            )

            for changed_path in item['changed_paths']:
                copyfrom_revision = None
                if changed_path['copyfrom_revision']:
                    copyfrom_revision = changed_path[
                        'copyfrom_revision'].number

                change = Change.objects.create(
                    changeset=changeset,
                    path=changed_path['path'],
                    action=changed_path['action'],
                    copied_from_path=changed_path['copyfrom_path'],
                    copied_from_revision=copyfrom_revision)

    sync_changesets = transaction.atomic(
        map_svn_exceptions(sync_changesets))

    def get_latest_revision(self):
        """
        Get the latest revision of the repository.
        """
        revision = 0
        if self.changesets.count():
            revision = self.changesets.all()[0].revision
        return revision

    def get_node(self, path, revision=None):
        """
        Get a `svnkit.models.Node` object at the given
        path. Optionally specify a revision.
        """
        Node = get_model('svnkit', 'Node')
        return Node.objects.get_or_sync(self, path, revision)


@python_2_unicode_compatible
class AbstractChangeset(Model):
    """
    The meta data about a revision in a subversion repository.
    """
    repository = fields.FlexibleForeignKey('svnkit.Repository', related_name='changesets')
    date = models.DateTimeField()
    revision = models.PositiveIntegerField(db_index=True)
    author = models.CharField(max_length=512)
    message = models.TextField()

    class Meta:
        abstract = True
        app_label = 'svnkit'
        db_table = 'cobra_svn_changeset'
        unique_together = (('repository', 'revision'),)
        ordering = ('-revision',)

    __repr__ = sane_repr('repository_id', 'revision')

    def __str__(self):
        return 'r%s' % self.revision

    @property
    def title(self):
        message = strip(self.message)
        if not message:
            message = '<unlabeled message>'
        else:
            message = truncatechars(message.splitlines()[0], 50)
        return message

    @property
    def rest_message(self):
        message = strip(self.message)
        if not message:
            message = '<unlabeled message>'
        else:
            split_msgs = message.splitlines()
            first_line_msg = split_msgs[0]
            if len(first_line_msg) > 50:
                split_msgs[0] = '...'+first_line_msg[47:]
            else:
                del split_msgs[0]
            message = '\n'.join(split_msgs)
        return message

    @models.permalink
    def get_absolute_url(self):
        return ('svnkit:changeset', (self.repository.project.organization.slug, self.repository.project.slug, self.revision))

    def get_previous(self):
        """Get the previous changeset in the repository."""
        try:
            return self.repository.changesets.get(revision=self.revision - 1)
        except self.__class__.DoesNotExist:
            return None

    def get_next(self):
        """Get the next changeset in the repository."""
        try:
            return self.repository.changesets.get(revision=self.revision + 1)
        except self.__class__.DoesNotExist:
            return None


@python_2_unicode_compatible
class AbstractChange(Model):
    """
    A changed path in a changeset, including the action taken.
    """
    changeset = fields.FlexibleForeignKey('svnkit.Changeset', related_name='changes')
    path = models.CharField(max_length=2048, db_index=True)
    action = models.CharField(max_length=1)

    copied_from_path = models.CharField(max_length=2048, null=True)
    copied_from_revision = models.PositiveIntegerField(null=True)

    class Meta:
        abstract = True
        app_label = 'svnkit'
        db_table = 'cobra_svn_change'
        unique_together = (('changeset', 'path'),)
        ordering = ('changeset', 'path')

    __repr__ = sane_repr('action', 'path')

    def __str__(self):
        return '%s %s' % (self.action, self.path)

    def _get_base_change(self):
        if hasattr(self, '_base_change'):
            return self._base_change
        if self.copied_from_revision is not None:
            self._base_change = self.__class__.objects.get(
                changeset__repository=self.changeset.repository,
                revision=self.copied_from_revision
            )
            return self._base_change

    @property
    def relative_path(self):
        if self.changeset.repository.prefix:
            repo_prefix = self.changeset.repository.prefix
            if repo_prefix.endswith(posixpath.sep):
                repo_prefix = repo_prefix[:-1]
            return self.path.replace(repo_prefix, '', 1)
        else:
            return self.path

    def is_addition(self):
        return self.action == 'A'

    def is_modification(self):
        return self.action == 'M'

    def is_deletion(self):
        return self.action == 'D'


@python_2_unicode_compatible
class AbstractNode(Model):
    """
    The meta data for a path at a revision in a repository.
    Nodes can be understood as 'views' of a particular path in a
    repository at a particular revision number (a revision that may or
    may not have made changes at that path/revision). A node's actual
    content is stored in a separate model object, since the content
    may remain unchanged across a number of revisions at a particular
    path. The `get_last_changeset` method can be used to obtain the
    changeset and revision in which the node's path was last changed.
    This model largely reflects the information available through the
    subversion api. The field `cached` indicates when the data was
    retrieved from the api, and `cached_indirectly` indicates whether
    or not the node was generated from an api call for the node or
    from a related node (parent or one of its possible
    children). Indirectly cached nodes (which are usually nodes
    created as placeholders for heirarchical connections instead of
    through a direct api call) require another api call to collect the
    remaining missing information. Nodes can be optionally be included
    in a regular cleanup.
    """
    repository = fields.FlexibleForeignKey('svnkit.Repository', related_name='nodes')
    parent = fields.FlexibleForeignKey('svnkit.Node', related_name='children', null=True)
    path = models.CharField(max_length=2048, db_index=True)
    node_type = models.CharField(max_length=1)
    size = models.PositiveIntegerField(default=0)
    last_changed = models.DateTimeField(null=True)

    revision = models.PositiveIntegerField()
    cached = models.DateTimeField(default=datetime.datetime.now)
    cached_indirectly = models.BooleanField(default=True)

    content = fields.FlexibleForeignKey('svnkit.Content', related_name='nodes', null=True)

    objects = NodeManager(cache_fields=(
        'pk',
    ))

    class Meta:
        abstract = True
        app_label = 'svnkit'
        db_table = 'cobra_svn_node'
        unique_together = (('repository', 'path', 'revision'),)
        ordering = ('node_type', 'path')

    __repr__ = sane_repr('path', 'revision')

    def __str__(self):
        return '%s@%s' % (self.path, self.revision)

    def iter_path(self):
        """
        Returns a generator that 'walks` up the node hierarchy,
        yielding each parent path until the root node is reached ('/').
        """
        path = self.path
        yield path
        while path != posixpath.sep:
            path = posixpath.split(path)[0]
            yield path

    def iter_path_basename(self):
        """
        Returns a generator that 'walks' up the node hierarchy,
        yielding a tuple of the path, and the basename of the path for
        each parent node until the root node is reached ('/').
        """
        for path in self.iter_path():
            basename = posixpath.basename(path)
            if not basename:
                # basename = self.repository.label
                basename = self.repository.project.slug
            yield (path, basename)

    def get_last_changeset(self):
        """Get the latest `Changeset` object that affected this node."""
        c = self.repository.changesets.filter(
            date__lte=self.last_changed)#.exclude(revision=self.revision)
        if c.count():
            return c[0]
        else:
            return self.repository.changesets.get(date=self.last_changed)

    @models.permalink
    def get_absolute_url(self):
        repository = self.repository
        if self.revision != repository.get_latest_revision():
            return (
                'svnkit:node-revision', (
                repository.project.organization.slug, repository.project.slug, self.revision, self.path))
        else:
            return ('svnkit:node', (repository.project.organization.slug, repository.project.slug, self.path))

    def get_basename(self):
        """
        The basename of the node, either a file name or a directory
        name.
        """
        basename = posixpath.basename(self.path)
        return basename

    def is_directory(self):
        """Whether the node is a directory."""
        return self.node_type == choices.NODE_TYPE_DIR

    def is_file(self):
        """Whether the node is a file."""
        return self.node_type == choices.NODE_TYPE_FILE

    def is_root(self):
        """Whether the node is the root node ('/')."""
        return self.is_directory() and self.path == posixpath.sep

    def has_properties(self):
        """Whether the node has subversion properties set."""
        if self.properties.count():
            return True
        return False


@python_2_unicode_compatible
class AbstractProperty(Model):
    """
    A property that has been set on a node.
    """
    node = fields.FlexibleForeignKey('svnkit.Node', related_name='properties')
    key = models.CharField(max_length=512, db_index=True)
    value = models.TextField()

    class Meta:
        abstract = True
        app_label = 'svnkit'
        db_table = 'cobra_svn_property'
        unique_together = (('node', 'key'),)
        verbose_name_plural = 'properties'

    __repr__ = sane_repr('path', 'revision')

    def __str__(self):
        return '%s: %s' % (self.key, self.value)


@python_2_unicode_compatible
class AbstractContent(Model):
    """
    The contents of a node at a revision.
    The data is base64 encoded in the database to allow storage of
    binary data. The `set_data` and `get_data` methods should be used
    to manipulate a node's data. `cached` indicates when the contents
    were retrieved from the api. Content objects can optionally be
    part of a regular cleanup.
    """
    repository = fields.FlexibleForeignKey('svnkit.Repository', related_name='content')
    path = models.CharField(max_length=2048)
    last_changed = models.DateTimeField()
    cached = models.DateTimeField(default=datetime.datetime.now)
    size = models.PositiveIntegerField(default=0)
    data = models.TextField()

    class Meta:
        abstract = True
        app_label = 'svnkit'
        db_table = 'cobra_svn_content'
        unique_together = (('repository', 'path', 'last_changed'),)

    __repr__ = sane_repr('path', 'repository_id')

    def __str__(self):
        return '%s@%s' % (self.path, self.get_last_changeset())

    def set_data(self, data):
        self.size = len(data)
        self.data = data.encode('base64')

    def get_data(self):
        if hasattr(self, '_decoded_data'):
            return self._decoded_data
        self._decoded_data = self.data.decode('base64')
        return self._decoded_data

    def get_last_changeset(self):
        """Get the changeset in which this content was committed."""
        return self.repository.changesets.get(date=self.last_changed)

    def get_mimetype(self):
        """
        Get the mimetype of the content. This is determined by the
        extension of the basename of the path. Defaults to
        application/octet-stream if the mimetype cannot be determined.
        """
        mtype = mimetypes.guess_type(self.path)[0]
        if mtype is None:
            return 'application/octet-stream'
        return mtype

    def get_maintype(self):
        """
        Get the maintype of the mimetype, i.e. 'image' in 'image/png'.
        """
        return self.get_mimetype().split('/')[0]

    def get_subtype(self):
        """
        Get the subtype of the mimetype, i.e. 'png' in 'image/png'.
        """
        return self.get_mimetype().split('/')[-1]

    @models.permalink
    def get_absolute_url(self):
        return ('svnkit:content', (
                self.repository.project.organization.slug, self.repository.project.slug, self.pk, self.get_basename()))

    def is_binary(self):
        """
        Whether or not the content is binary. This is determined in
        part by the mimetype, but if the mimetype is not available,
        then if the data cannot be decoded into ascii it will be
        presumed a binary format.
        """
        # mtype = mimetypes.guess_type(self.path)[0]
        # if mtype is None:
            # try:
            #     self.get_data().decode('gbk')
            # except UnicodeDecodeError:
            #     return True
            # return False
        chunk = get_starting_chunk(self.get_data())
        return is_binary_string(chunk)
        # if not mtype.startswith('text'):
        #     return True
        # return False

    def get_basename(self):
        """Get the basename of the node's full path (the filename)."""
        basename = posixpath.basename(self.path)
        return basename

    def get_data_display(self):
        """
        Get the content for display in text. Binary formats are just
        shown as '(binary)'. Plain text formats get run through the
        appropriate pygments lexer if the package is available.
        """
        if self.is_binary():
            return _('<pre>(binary)</pre>')

        try:
            txt = self.get_data().decode('utf-8')
        except UnicodeDecodeError:
            txt = self.get_data().decode('gbk')

        lexer = get_lexer(self.get_basename(), txt)
        return make_html(txt, lexer.name)
from __future__ import absolute_import, print_function

from hashlib import md5
import logging
import datetime
from django.conf import settings

from django.core.exceptions import ImproperlyConfigured
from django.core.urlresolvers import reverse
from django.db import models
from django.db.models import Q
from django.db import transaction
from django.utils.encoding import python_2_unicode_compatible
from django.utils.translation import ugettext_lazy as _
from django.utils import functional
from django.utils import timezone

from cobra.core.compat import AUTH_USER_MODEL
from cobra.models import Model
from cobra.models import fields
from cobra.models import sane_repr
from cobra.models.utils import slugify_instance
from cobra.core.http import absolute_uri
from cobra.core.constants import MEMBER_TYPES, MEMBER_USER
from cobra.core.loading import get_class, get_model

from .exceptions import map_svn_exceptions



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
        default=functional.curry(datetime.datetime.fromtimestamp, 0),
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

    sync_changesets = transaction.commit_on_success(
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

    def get_absolute_url(self):
        return ('svnlit_changeset', (self.repository.label, self.revision))
    get_absolute_url = models.permalink(get_absolute_url)

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
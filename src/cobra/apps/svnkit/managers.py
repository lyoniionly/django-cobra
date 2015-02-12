"""
Model managers that interface with the subversion API.
"""
from __future__ import absolute_import, print_function
import datetime
import posixpath

import pysvn
from django.db import transaction

from cobra.core.loading import get_model
from cobra.models import BaseManager

from . import choices, exceptions


class NodeManager(BaseManager):
    def get_or_sync(self, repository, path, revision=None):
        """
        Get a node in the given repository at the given path.
        Optionally specify a revision number. If the node has already
        been cached locally, the model object is returned. If it has
        not yet been cached, the node information is retrieved from an
        api call and cached locally before returning it.
        If the node is a file, and the contents have not been
        retrieved, the node's content is also obtained from the api.
        """
        Content = get_model('svnkit', 'Content')
        Property = get_model('svnkit', 'Property')

        if revision is None:
            revision = repository.get_latest_revision()
        # removing the trailing slash from the path
        if path.endswith(posixpath.sep) and len(path) > 1:
            path = path[:-1]
        # add slash to begining of path
        if not path.startswith(posixpath.sep):
            path = '/%s' % path

        try:
            node = self.get(
                repository=repository, revision=revision, path=path)

            # return a directory node if its been fully cached
            if (node.is_directory() and
                not node.cached_indirectly):
                return node

            # return a file node if its been fully cached and it's
            # content has been retrieved
            if (node.is_file() and
                not node.cached_indirectly
                and node.content is not None):
                return node

        except self.model.DoesNotExist:
            # no cached node was found, fetch it from the api
            pass

        # construct a full uri to the requested node
        if repository.root.endswith(posixpath.sep):
            root = repository.root[:-1]
        else:
            root = repository.root
        root_path = '%s%s' % (root, path)

        c = repository.get_svn_client()
        r = pysvn.Revision(pysvn.opt_revision_kind.number, revision)

        # get a listing of nodes for the given path. File nodes are
        # returned as a list containing one node, and directory nodes
        # are returned as a list with the first node in the list being
        # the directory node specified, followed by all its child
        # nodes.
        ls = c.list(root_path, recurse=False, peg_revision=r, revision=r)
        ls = map(lambda y: dict(y.items()), map(lambda x: x[0], ls))

        node_list = list()
        for item in ls:
            # sometimes double slashes appear in the returned path
            node_path = item['repos_path']

            # we meet a special situation, it is that the root of repo is not real 'root'
            # and we have no permission to access the real root, so, the repos_path that
            # has the prefix of real root must be cut off.

            if repository.prefix:
                repo_prefix = repository.prefix
                if repo_prefix.endswith(posixpath.sep):
                    repo_prefix = repo_prefix[:-1]
                node_path = node_path.replace(repo_prefix, '/', 1)
            else:
                # dsm = difflib.SequenceMatcher(None, root, node_path)
                # if dsm.get_matching_blocks():
                #     first_match = dsm.matching_blocks[0]
                #     repo_prefix = root[first_match[0]:first_match[0]+first_match[2]]
                #     node_path = node_path.replace(repo_prefix, '/', 1)
                pass

            if node_path.startswith('//'):
                node_path = node_path[1:]

            # when dealing with directory nodes, some or all child
            # nodes may already have been cached as model objects
            # locally.
            try:
                node = self.get(
                    repository=repository, path=node_path, revision=revision)
            except self.model.DoesNotExist:
                node = self.model(
                    repository=repository, path=node_path, revision=revision)

            node.node_type = choices.NODE_TYPE_MAP[item['kind']]
            node.last_changed = datetime.datetime.fromtimestamp(item['time'])
            node.size = item['size']
            node.cached_datetime = datetime.datetime.now()
            node_list.append(node)

        # separate out the primary node from any child nodes following it.
        # the primary node represents the repository/path/revision passed
        # to the get_or_sync method
        primary_node = filter(lambda n: n.path == path, node_list)[0]
        node_list.remove(primary_node)

        # the primary node is now fully cached
        primary_node.cached_indirectly = False

        # if the primary node is a directory, set all the child nodes'
        # parent to the primary node to establish the hierarchy within
        # the local model objects
        if primary_node.is_directory():
            for node in node_list:
                if node.path.startswith(primary_node.path):
                    node.parent = primary_node

        # if the primary node is a file, retrieve the content of the node.
        if primary_node.is_file() and primary_node.content is None:
            try:
                # applicable content for the primary node's
                # path/revision may already be cached as a model
                # object.
                primary_node.content = Content.objects.get(
                    repository=repository, path=primary_node.path,
                    last_changed=primary_node.last_changed)
            except Content.DoesNotExist:
                # otherwise the content is fetched from an api call
                content = Content(
                    repository=repository, path=primary_node.path,
                    last_changed=primary_node.last_changed)
                content.set_data(c.cat(root_path, revision=r, peg_revision=r))
                content.save()
                primary_node.content = content

        # obtain the parent node (if its not '/') if it hasn't been
        # obtained yet.
        if not primary_node.parent and not primary_node.is_root():
            parent_path = posixpath.dirname(primary_node.path)
            try:
                # the parent node may already be cached as a model object
                parent_node = self.get(
                    repository=repository, path=parent_path, revision=revision)
            except self.model.DoesNotExist:
                # create an indirectly cached node to use as the parent
                # (an additional api call will be needed later on to fill out the
                # rest of the information)
                parent_node = self.create(
                    repository=repository, path=parent_path, revision=revision,
                    node_type=choices.NODE_TYPE_DIR)
            primary_node.parent = parent_node

        primary_node.save()
        for n in node_list:
            n.parent = primary_node
            n.save()

        # collect the subversion properties set on the primary node
        # TODO: not sure if flushing is necessary here. It looks like
        # properties set at a given path/revision can be changed, so
        # we need to take care to check for updates.
        primary_node.properties.all().delete()
        prop_list = c.proplist(root_path, revision=r, peg_revision=r)
        for prop in prop_list:
            for key, value in prop[1].items():
                Property.objects.create(
                    node=primary_node, key=key, value=value)

        return primary_node

    get_or_sync = transaction.commit_on_success(
        exceptions.map_svn_exceptions(get_or_sync))
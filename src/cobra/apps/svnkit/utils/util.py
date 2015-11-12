from __future__ import absolute_import
import os
import posixpath
import pysvn

from cobra.core.constants import README_MARKUPS
from cobra.core.markup import rest2html, can_markup, is_markdown, is_rst, is_plain
from cobra.core.markdown import markdown


def get_readme(repository, path='', revision=None):
        # 1 - md
        # 2 - rst
        # 3 - txt
        readme_suffix_names = README_MARKUPS
        readme_name = ''
        if repository.root.endswith(posixpath.sep):
            root = repository.root[:-1]
        else:
            root = repository.root
        root_path = '%s%s' % (root, path)
        if revision is None:
            revision = repository.get_latest_revision()
        c = repository.get_svn_client()
        r = pysvn.Revision(pysvn.opt_revision_kind.number, revision)
        ls = c.list(root_path, recurse=False, peg_revision=r, revision=r)
        ls = map(lambda y: dict(y.items()), map(lambda x: x[0], ls))
        for item in ls:
            if pysvn.node_kind.file == item['kind']:
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

                if node_path.startswith('//'):
                    node_path = node_path[1:]

                head, tail = os.path.split(node_path)
                file_name, file_suffix = os.path.splitext(tail)
                if file_name.lower() == 'readme' and (file_suffix in readme_suffix_names):
                    readme_name = node_path
                    break
                if file_name.lower() == 'readme' and (file_suffix.lower()=='.txt' or file_suffix==''):
                    readme_name = node_path
        if readme_name:
            content = c.cat('%s%s' % (root, readme_name), revision=r, peg_revision=r)
            try:
                content = content.decode('utf-8')
            except UnicodeDecodeError:
                content = content.decode('gbk')

            if readme_name.startswith('/'):
                readme_name = readme_name[1:]

            if is_markdown(readme_name):
                content = markdown(content)
            elif is_rst(readme_name):
                content = rest2html(content)
            else:
                content = '<pre class="plain-readme">' + content + '</pre>'

            readme = {
                'name': readme_name,
                'content': content
            }
            return readme
        else:
            return
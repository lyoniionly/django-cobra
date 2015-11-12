from __future__ import division, absolute_import, print_function

import os
from urlparse import urlparse
from creole.exceptions import DocutilsImportError

try:
    import docutils
    from docutils import io, readers
    from docutils.core import publish_doctree, Publisher
    from docutils.writers import get_writer_class
    from docutils.transforms import TransformError, Transform
except ImportError as err:
    msg = (
              "%s - You can't use rest2html!"
              " Please install: http://pypi.python.org/pypi/docutils"
          ) % err
    raise DocutilsImportError(msg)

ALLOWED_SCHEMES = '''file ftp gopher hdl http https imap mailto mms news nntp
prospero rsync rtsp rtspu sftp shttp sip sips snews svn svn+ssh telnet
wais irc'''.split()


def rest2html(source, output_encoding='unicode'):
    """
    >>> rest2html("test!")
    '<p>test!</p>\\n'
    """
    settings_overrides = {
        'raw_enabled': 0,  # no raw HTML code
        'file_insertion_enabled': 0,  # no file/URL access
        'halt_level': 2,  # at warnings or errors, raise an exception
        'report_level': 5,  # never report problems with the reST code
        'syntax_highlight': 'short'
    }

    # Convert reStructuredText to HTML using Docutils.
    document = publish_doctree(source=source,
                               settings_overrides=settings_overrides)

    for node in document.traverse():
        if node.tagname == '#text':
            continue
        if node.hasattr('refuri'):
            uri = node['refuri']
        elif node.hasattr('uri'):
            uri = node['uri']
        else:
            continue
        o = urlparse(uri)
        if o.scheme not in ALLOWED_SCHEMES:
            raise TransformError('link scheme not allowed')

    # now turn the transformed document into HTML
    reader = readers.doctree.Reader(parser_name='null')
    pub = Publisher(reader, source=io.DocTreeInput(document),
                    destination_class=io.StringOutput)
    pub.set_writer('html')
    pub.process_programmatic_settings(None, settings_overrides, None)
    pub.set_destination(None, None)
    pub.publish()
    parts = pub.writer.parts

    output = parts['body']

    if output_encoding != 'unicode':
        output = output.encode(output_encoding)

    return output


def is_markdown(filename):
    f, suffix = os.path.splitext(filename)
    if suffix in ['.markdown', '.mdown', '.mkdn', '.md']:
        return True
    else:
        return False


def is_rst(filename):
    if filename.lower().endswith('.rst'):
        return True
    else:
        return False


def is_plain(filename):
    if filename.lower().endswith('.txt') or filename.lower() == 'readme':
        return True
    else:
        return False


def can_markup(filename):
    if is_markdown(filename) or is_rst(filename):
        return True
    else:
        return False
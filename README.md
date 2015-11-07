# django-cobra
The django-cobra is a auto testing system that builded by Django framework.

pygments
docutils
markdown2
python-creole


def pypi_rest2html(source, output_encoding='unicode'):
    """
    >>> pypi_rest2html("test!")
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
    
from creole.rest_tools.pypi_rest2html import pypi_rest2html

__author__ = 'lyon'

f = open("d:/ddd.rst", "r")
str = f.read()
print pypi_rest2html(str)
f.close()


import markdown2

input_file = open("d:/nnn.md", mode="r")
text = input_file.read()
# html = markdown.markdown(text, extensions=['markdown.extensions.codehilite'])
aa = markdown2.markdown(text, extras=['fenced-code-blocks'])
# print html
print aa
input_file.close()

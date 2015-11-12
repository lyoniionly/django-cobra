from __future__ import division, absolute_import, print_function
import markdown2

def markdown(text, *args, **kwargs):
    if text == None or text.strip() == "":
        return ""
    html = markdown2.markdown(text, extras=['fenced-code-blocks'])
    return html
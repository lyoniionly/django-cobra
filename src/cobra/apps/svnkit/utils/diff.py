from __future__ import absolute_import

import re
import difflib

DIFF_OPTCODE_MAP = {' ': 'nil', '-': 'sub', '+': 'add', '^': 'chg', '\t':'tab'}


def optcodes_to_slices(optcodes):
    if optcodes.startswith('? '):
        optcodes = optcodes[2:-1]
    sections = filter(lambda x: x, re.split('( +)', optcodes))
    slices = []
    for x in range(len(sections)):
        start_pos = reduce(lambda x, y: x + len(y), sections[:x], 0)
        end_pos = start_pos + len(sections[x])
        slices.append((slice(start_pos, end_pos), sections[x][0]))
    slices.append((slice(len(optcodes), None), ' '))
    return slices


def diff_lines(content1, content2, source_type="diff"):
    """
    """
    from cobra.apps.svnkit.markup.hightlighter import make_html
    diff_lines = list(make_diff(content1, content2))

    data_lines = []
    line_no = 0
    line_padding = len(str(len(diff_lines)))
    line_no_a = line_no_b = 0

    for line in diff_lines:
        if line.startswith('? '):
            pass
            # slices = optcodes_to_slices(line)
            # spans = map(lambda x: {
            #     'type': DIFF_OPTCODE_MAP[x[1]],
            #     'text': data_lines[-1]['slices'][0]['text'][x[0]]}, slices)
            # line = {
            #     'type': DIFF_OPTCODE_MAP['^'], 'slices': spans,
            #     'number_a': data_lines[-1]['number_a'],
            #     'number_b': data_lines[-1]['number_b']}
            # data_lines[-1] = line
            # if data_lines[-2]['type'] != DIFF_OPTCODE_MAP[' ']:
            #     data_lines[-2]['type'] = DIFF_OPTCODE_MAP['^']

        else:
            if line[:1] == '+':
                line_no_a += 1; number_a = line_no_a; number_b = ''
            elif line[:1] == '-':
                line_no_b += 1; number_a = ''; number_b = line_no_b
            elif line[:1] == ' ':
                line_no_a += 1; line_no_b += 1
                number_a = line_no_a; number_b = line_no_b
            data_lines.append({
                'type': DIFF_OPTCODE_MAP[line[:1]],
                'number_a': unicode(number_a).rjust(line_padding),
                'number_b': unicode(number_b).rjust(line_padding),
                'slices': [{'type': DIFF_OPTCODE_MAP[' '], 'text': make_html(line[2:], source_type, lineno=False)}]})

        line_no += 1

    return data_lines



def make_diff(content1, content2, mode="Differ"):
    """
    returns the diff as a String, made with difflib.Differ.
    """
    def prepare(content):
        if isinstance(content, (list, tuple)):
            return content

        return content.splitlines()

    content1 = prepare(content1)
    content2 = prepare(content2)

    if mode == "Differ":
        diff = difflib.Differ().compare(content1, content2)
    elif mode == "HtmlDiff":
        diff = difflib.HtmlDiff(tabsize=4).make_table(content1, content2)
    elif mode == "unified":
        diff = difflib.unified_diff(content1, content2)
    else:
        raise AssertionError("diff mode %r unknown." % mode)

    return diff
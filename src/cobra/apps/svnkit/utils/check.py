from __future__ import absolute_import
import pysvn

ALWAYS = "ALWAYS"
NEVER = "NEVER"

DESIRED_BEHAVIOR = ALWAYS

def ssl_server_certificate_trust_prompt(trust_dict):
    if DESIRED_BEHAVIOR == NEVER:
        return (False, 0, False)
    elif DESIRED_BEHAVIOR == ALWAYS:
        return (True, trust_dict['failures'], True)
    raise Exception, "Unsupported behavior"


def check_repo_valid(url, username='', password=''):
    c = pysvn.Client()
    c.callback_ssl_server_trust_prompt = ssl_server_certificate_trust_prompt
    c.callback_get_login = lambda x, y, z: (True, username, password, False)
    head_rev = pysvn.Revision(pysvn.opt_revision_kind.head)
    try:
        c.info2(url, revision=head_rev, recurse=False)
        return (True, 'Success')
    except pysvn.ClientError as ce:
        return (False, ce.args[0])
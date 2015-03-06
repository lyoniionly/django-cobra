import os
import six

# Use 'dev', 'beta', or 'final' as the 4th element to indicate release type.

VERSION = (1, 1, 0, 'dev')


def get_short_version():
    return '%s.%s' % (VERSION[0], VERSION[1])


def get_version():
    version = '%s.%s' % (VERSION[0], VERSION[1])
    # Append 3rd digit if > 0
    if VERSION[2]:
        version = '%s.%s' % (version, VERSION[2])
    elif VERSION[3] != 'final':
        version = '%s %s' % (version, VERSION[3])
        if len(VERSION) == 5:
            version = '%s %s' % (version, VERSION[4])
    return version


# Cheeky setting that allows each template to be accessible by two paths.
# Eg: the template 'cobra/templates/cobra/base.html' can be accessed via both
COBRA_CORE_APPS = [
    'cobra',
    'cobra.apps.accounts',
    'cobra.apps.auditlog',
    'cobra.apps.dashboard',
    'cobra.apps.dashboard.auditlog',
    'cobra.apps.home',
    'cobra.apps.option',
    'cobra.apps.project',
    'cobra.apps.accessgroup',
    'cobra.apps.nodestore',
    'cobra.apps.organization',
    'cobra.apps.team',
    'cobra.apps.svnkit',
    # 3rd-party apps that cobra depends on
    # 'haystack',
    # 'treebeard',
    # 'sorl.thumbnail',
    'django_statsd',
    'easy_thumbnails',
    'sudo',
    'django_tables2',
    'crispy_forms',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    # include the providers you want to enable:
    'allauth.socialaccount.providers.bitbucket',
    'allauth.socialaccount.providers.github',
    'allauth.socialaccount.providers.weibo',
]
# 'base.html' and 'cobra/base.html'.  This allows Cobra's templates to be
# extended by templates with the same filename
COBRA_MAIN_TEMPLATE_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), 'templates/cobra')


def get_core_apps(overrides=None):
    """
    Return a list of cobra's apps amended with any passed overrides
    """
    if not overrides:
        return COBRA_CORE_APPS

    if isinstance(overrides, six.string_types):
        raise ValueError(
            "get_core_apps expects a list or tuple of apps "
            "to override")

    def get_app_label(app_label, overrides):
        pattern = app_label.replace('cobra.apps.', '')
        for override in overrides:
            if override.endswith(pattern):
                if 'dashboard' in override and 'dashboard' not in pattern:
                    continue
                return override
        return app_label

    apps = []
    for app_label in COBRA_CORE_APPS:
        apps.append(get_app_label(app_label, overrides))
    return apps

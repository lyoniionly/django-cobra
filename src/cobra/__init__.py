import os

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
    # 'cobra.apps.analytics',
    # 'cobra.apps.checkout',
    # 'cobra.apps.address',
    # 'cobra.apps.shipping',
    # 'cobra.apps.catalogue',
    # 'cobra.apps.catalogue.reviews',
    # 'cobra.apps.partner',
    # 'cobra.apps.basket',
    # 'cobra.apps.payment',
    # 'cobra.apps.offer',
    # 'cobra.apps.order',
    'cobra.apps.home',
    'cobra.apps.project',
    'cobra.apps.accessgroup',
    'cobra.apps.customer',
    'cobra.apps.nodestore',
    'cobra.apps.organization',
    'cobra.apps.team',
    # 'cobra.apps.promotions',
    # 'cobra.apps.search',
    # 'cobra.apps.voucher',
    # 'cobra.apps.wishlists',
    # 'cobra.apps.dashboard',
    # 'cobra.apps.dashboard.reports',
    # 'cobra.apps.dashboard.users',
    # 'cobra.apps.dashboard.orders',
    # 'cobra.apps.dashboard.promotions',
    # 'cobra.apps.dashboard.catalogue',
    # 'cobra.apps.dashboard.offers',
    # 'cobra.apps.dashboard.partners',
    # 'cobra.apps.dashboard.pages',
    # 'cobra.apps.dashboard.ranges',
    # 'cobra.apps.dashboard.reviews',
    # 'cobra.apps.dashboard.vouchers',
    # 'cobra.apps.dashboard.communications',
    # 3rd-party apps that cobra depends on
    # 'haystack',
    # 'treebeard',
    # 'sorl.thumbnail',
    'sudo',
    'django_tables2',
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

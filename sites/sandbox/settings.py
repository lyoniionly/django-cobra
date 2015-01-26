"""
Settings for Cobra's Sandbox site.

Notes:

* The Sandbox site uses the stores extension which requires a spatial database.
  Only the postgis and spatialite backends are tested, but all backends
  supported by GeoDjango should work.

"""

import os, sys

# Django settings for cobra project.
location = lambda x: os.path.join(
    os.path.dirname(os.path.realpath(__file__)), x)

DEBUG = True
TEMPLATE_DEBUG = True
SQL_DEBUG = True

if DEBUG:
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))
    sys.path.append(os.path.join(BASE_DIR, '../src'))

EMAIL_SUBJECT_PREFIX = '[Cobro Auto Testing System] '
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

ALLOWED_HOSTS = ['ats.cobra.com']

# Use settings_local to override this default
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'cobra',
        'USER': 'cobra',
        'PASSWORD': '',
        'HOST': 'localhost',
        'PORT': '',
    }
}

SITE_ID = 1

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

# Prevent Django 1.7+ from showing a warning regarding a changed default test
# runner. The Cobra test suite is run with nose, so it does not matter.
SILENCED_SYSTEM_CHECKS = ['1_6.W001', ]

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'Asia/Shanghai'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-gb'

LANGUAGES = (
    ('en-gb', 'English'),
)

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# Absolute path to the directory that holds media.
# Example: "/home/media/media.lawrence.com/"
MEDIA_ROOT = location("public/media")

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
MEDIA_URL = '/media/'

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
#ADMIN_MEDIA_PREFIX = '/media/admin/'

STATIC_URL = '/static/'
STATICFILES_DIRS = (
    location('static'),
)
STATIC_ROOT = location('public/static')
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '$)a7n&o80u!6y5t-+jrd3)3!%vh&shg$wqpjpxc!ar&p#!)n1a'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
    # needed by django-treebeard for admin (and potentially other libs)
    'django.template.loaders.eggs.Loader',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.request",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.static",
    "django.contrib.messages.context_processors.messages",
    # Cobra specific
    # 'cobra.apps.search.context_processors.search_form',
    # 'cobra.apps.promotions.context_processors.promotions',
    # 'cobra.apps.checkout.context_processors.checkout',
    'cobra.core.context_processors.metadata',
    'cobra.apps.customer.notifications.context_processors.notifications',
)

MIDDLEWARE_CLASSES = (
    'cobra.middleware.maintenance.ServicesUnavailableMiddleware',
    'cobra.middleware.proxy.SetRemoteAddrFromForwardedFor',
    'cobra.middleware.debug.NoIfModifiedSinceMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'cobra.middleware.sudo.SudoMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.transaction.TransactionMiddleware',
    'django.contrib.flatpages.middleware.FlatpageFallbackMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    # 'cobra.apps.basket.middleware.BasketMiddleware',
)

DEBUG_TOOLBAR_PATCH_SETTINGS = False
INTERNAL_IPS = ('127.0.0.1',)


ROOT_URLCONF = 'urls'

from cobra import COBRA_MAIN_TEMPLATE_DIR
TEMPLATE_DIRS = (
    location('templates'),
    COBRA_MAIN_TEMPLATE_DIR,
)

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'null': {
            'level': 'DEBUG',
            'class': 'django.utils.log.NullHandler',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'checkout_file': {
            'level': 'INFO',
            'class': 'cobra.core.logging.handlers.EnvFileHandler',
            'filename': 'checkout.log',
            'formatter': 'verbose'
        },
        'error_file': {
            'level': 'INFO',
            'class': 'cobra.core.logging.handlers.EnvFileHandler',
            'filename': 'errors.log',
            'formatter': 'verbose'
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
            'filters': ['require_debug_false'],
        },
    },
    'loggers': {
        'django': {
            'handlers': ['null'],
            'propagate': True,
            'level': 'INFO',
        },
        'django.request': {
            'handlers': ['mail_admins', 'error_file'],
            'level': 'ERROR',
            'propagate': False,
        },
        'cobra.errors': {
            'handlers': ['console', 'error_file'],
            'propagate': False,
        },
        'cobra.checkout': {
            'handlers': ['console', 'checkout_file'],
            'propagate': True,
            'level': 'INFO',
        },
        'datacash': {
            'handlers': ['console'],
            'propagate': True,
            'level': 'INFO',
        },
        'django.db.backends': {
            'handlers': ['null'],
            'propagate': False,
            'level': 'DEBUG',
        },
    }
}


INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.admin',
    'django.contrib.flatpages',
    'django.contrib.staticfiles',
    # 'django.contrib.gis',
    # Cobra dependencies
    'compressor',
    'widget_tweaks',
    # Cobra extensions
    #'stores',
    #'paypal',
    #'datacash',
    # External apps
    'django_extensions',
    'debug_toolbar',
    # For profile testing
    'apps.user',
    # Sentry (for live demo site)
    #'raven.contrib.django.raven_compat'
]

# South is only supported in Django < 1.7
import django
if django.VERSION < (1, 7):
    INSTALLED_APPS.append('south')

# Include core apps with a few overrides:
# If you have apps to override the cobra apps
# you can give the arg(type list) to the get_core_apps
# EX:
#     get_core_apps(['apps.appname', 'apps.appname'])
from cobra import get_core_apps
INSTALLED_APPS = INSTALLED_APPS + get_core_apps()

AUTHENTICATION_BACKENDS = (
    'cobra.apps.customer.auth_backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
)

LOGIN_REDIRECT_URL = '/'
APPEND_SLASH = True

# Haystack settings - we use a local Solr instance running on the default port
# HAYSTACK_CONNECTIONS = {
#     'default': {
#         'ENGINE': 'haystack.backends.solr_backend.SolrEngine',
#         'URL': 'http://127.0.0.1:8983/solr',
#     },
# }

# We still use this deprecated Django setting since Cobra needs a way of
# knowing where the profile class is (if one is used).
AUTH_PROFILE_MODULE = 'user.Profile'

# Cobra settings
from cobra.defaults import *

COBRA_RECENTLY_VIEWED_PRODUCTS = 20
COBRA_ALLOW_ANON_CHECKOUT = True

COBRA_SHOP_NAME = 'Cobra'
COBRA_SHOP_TAGLINE = 'Sandbox'

COMPRESS_ENABLED = False
COMPRESS_PRECOMPILERS = (
    ('text/less', 'lessc {infile} {outfile}'),
)

THUMBNAIL_KEY_PREFIX = 'cobra-sandbox'

LOG_ROOT = location('logs')
# Ensure log root exists
if not os.path.exists(LOG_ROOT):
    os.mkdir(LOG_ROOT)

DISPLAY_VERSION = False

USE_TZ = True

# Must be within MEDIA_ROOT for sorl to work
COBRA_MISSING_IMAGE_URL = 'image_not_found.jpg'

GOOGLE_ANALYTICS_ID = 'UA-45363517-4'

# Add stores node to navigation
new_nav = COBRA_DASHBOARD_NAVIGATION
new_nav.append(
    {
        'label': 'Stores',
        'icon': 'icon-shopping-cart',
        'children': [
            {
                'label': 'Stores',
                'url_name': 'stores-dashboard:store-list',
            },
            {
                'label': 'Store groups',
                'url_name': 'stores-dashboard:store-group-list',
            },
        ]
    })
new_nav.append(
    {
        'label': 'Datacash',
        'icon': 'icon-globe',
        'children': [
            {
                'label': 'Transactions',
                'url_name': 'datacash-transaction-list',
            },
        ]
    })
COBRA_DASHBOARD_NAVIGATION = new_nav

# GEOIP_PATH = os.path.join(os.path.dirname(__file__), 'geoip')

# Note, client and password are omitted here. They are assigned in
# settings_local but kept out of source control.
#DATACASH_HOST = 'testserver.datacash.com'
#DATACASH_CLIENT = ''
#DATACASH_PASSWORD = ''
#DATACASH_USE_CV2AVS = True
#DATACASH_CURRENCY = 'GBP'

# Some mildly sensitive settings are kept out this file, such as the secret
# key, paypal credentials and datacash credentials.  If you want to test the
# full checkout process of the demo site locally then then you'll need to
# assign your own payment gateway details in settings_local.py. This may
# involve signing up for a Datacash or PayPal account.
try:
    from settings_local import *
except ImportError:
    pass

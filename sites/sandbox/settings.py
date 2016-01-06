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
SQL_DEBUG = True

# The entry of maintaince mode
MAINTENANCE = False

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

USE_TZ = True

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

USE_L10N = True

LANGUAGE_CODE = 'zh-hans'

# Languages we provide translations for, out of the box.
gettext_noop = lambda s: s
LANGUAGES = (
    ('en', gettext_noop('English')),
    ('zh-hans', gettext_noop('Simplified Chinese')),
)

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

MIDDLEWARE_CLASSES = (
    'cobra.middleware.maintenance.ServicesUnavailableMiddleware',
    'cobra.middleware.proxy.SetRemoteAddrFromForwardedFor',
    'cobra.middleware.debug.NoIfModifiedSinceMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'cobra.middleware.sudo.SudoMiddleware',
    'cobra.middleware.locale.CobraLocaleMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # 'django.middleware.transaction.TransactionMiddleware', # The transaction middleware was deprecated in Django 1.6, and removed in Django 1.8
    'django.contrib.flatpages.middleware.FlatpageFallbackMiddleware',
    'cobra.middleware.ajax.AjaxMessagingMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware',
)

if DEBUG:
    DEBUG_TOOLBAR_PATCH_SETTINGS = False
    INTERNAL_IPS = ('127.0.0.1',)
    DEBUG_TOOLBAR_CONFIG = {
        # Toolbar options
        'JQUERY_URL': '//ajax.useso.com/ajax/libs/jquery/2.1.3/jquery.min.js',
    }
    DEBUG_TOOLBAR_PANELS = (
        'debug_toolbar.panels.versions.VersionsPanel',
        'debug_toolbar.panels.timer.TimerPanel',
        'debug_toolbar.panels.settings.SettingsPanel',
        'debug_toolbar.panels.headers.HeadersPanel',
        'debug_toolbar.panels.request.RequestPanel',
        'debug_toolbar.panels.sql.SQLPanel',
        'debug_toolbar.panels.staticfiles.StaticFilesPanel',
        'debug_toolbar.panels.templates.TemplatesPanel',
        'debug_toolbar.panels.cache.CachePanel',
        'debug_toolbar.panels.signals.SignalsPanel',
        'debug_toolbar.panels.logging.LoggingPanel',
        'debug_toolbar.panels.redirects.RedirectsPanel',
        'django_statsd.panel.StatsdPanel',
    )

    # django-statsd
    STATSD_CLIENT = 'django_statsd.clients.toolbar'
else:
    STATSD_CLIENT = 'django_statsd.clients.normal'


ROOT_URLCONF = 'urls'

# For crispy_forms, use the bootstrap3 UI
CRISPY_TEMPLATE_PACK = 'bootstrap3'

from cobra import COBRA_MAIN_TEMPLATE_DIR
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [location('templates'), COBRA_MAIN_TEMPLATE_DIR],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                "django.contrib.auth.context_processors.auth",
                "django.template.context_processors.request",
                "django.template.context_processors.debug",
                "django.template.context_processors.i18n",
                "django.template.context_processors.media",
                "django.template.context_processors.static",
                "django.contrib.messages.context_processors.messages",
                # Cobra specific
                'cobra.core.context_processors.metadata',
            ],
            'debug': True
        },
    },
]

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
        # 'null': {
        #     'level': 'DEBUG',
        #     'class': 'django.utils.log.NullHandler',
        # },
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
        # 'django': {
        #     'handlers': ['null'],
        #     'propagate': True,
        #     'level': 'INFO',
        # },
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
        # 'django.db.backends': {
        #     'handlers': ['null'],
        #     'propagate': False,
        #     'level': 'DEBUG',
        # },
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
    # For profile
    'apps.user',
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
    # Needed to login by username in Django admin, regardless of `allauth`
    "django.contrib.auth.backends.ModelBackend",

    # `allauth` specific authentication methods, such as login by e-mail
    "allauth.account.auth_backends.AuthenticationBackend",
)

LOGIN_REDIRECT_URL = '/'
LOGIN_URL = '/auth/login/'
LOGOUT_URL = '/auth/logout/'

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

# django-allauth will use 'auth.User' for default
# but, cobra has custom the User model in cobra.accounts app
# so, We must set it for django-allauth
AUTH_USER_MODEL = 'accounts.User'

#allath settings
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = 'none'#'mandatory'
ACCOUNT_USERNAME_BLACKLIST = ['cobra', 'admin', 'case', 'test']
ACCOUNT_AUTHENTICATION_METHOD = 'username_email'
ACCOUNT_SIGNUP_FORM_CLASS = 'cobra.apps.accounts.forms.SignupForm'
ACCOUNT_ADAPTER = 'cobra.apps.accounts.adapter.AccountAdapter'
ACCOUNT_LOGOUT_ON_GET = True
ACCOUNT_LOGOUT_REDIRECT_URL = '/auth/login/'


# Cobra settings
from cobra.defaults import *

COBRA_RECENTLY_VIEWED_PRODUCTS = 20
COBRA_ALLOW_ANON_CHECKOUT = True

COBRA_SYSTEM_NAME = 'Cobra'
COBRA_SYSTEM_TAGLINE = 'Sandbox'

COBRA_ACCOUNTS_AVATAR_DEFAULT = 'cobra/img/avatar/default_avatar.png'
COBRA_ACCOUNTS_AVATAR_GRAVATAR = False

# LESS/CSS/statics
# ================

# We default to using CSS files, rather than the LESS files that generate them.
# If you want to develop Oscar's CSS, then set USE_LESS=True and
# COMPRESS_ENABLED=False in your settings_local module and ensure you have
# 'lessc' installed.
USE_LESS = True

COMPRESS_ENABLED = True
COMPRESS_PRECOMPILERS = (
    ('text/less', 'lessc --source-map-less-inline --source-map-map-inline {infile} {outfile}'),
)
COMPRESS_OFFLINE_CONTEXT = {
    'STATIC_URL': 'STATIC_URL',
    'use_less': USE_LESS,
}

# We do this to work around an issue in compressor where the LESS files are
# compiled but compression isn't enabled.  When this happens, the relative URL
# is wrong between the generated CSS file and other assets:
# https://github.com/jezdez/django_compressor/issues/226
COMPRESS_OUTPUT_DIR = 'cobra'

THUMBNAIL_KEY_PREFIX = 'cobra-sandbox'

LOG_ROOT = location('logs')
# Ensure log root exists
if not os.path.exists(LOG_ROOT):
    os.mkdir(LOG_ROOT)

DISPLAY_VERSION = False

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

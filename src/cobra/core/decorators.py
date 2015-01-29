from __future__ import absolute_import, print_function

from functools import wraps
import logging
import warnings
from django.db import OperationalError


def deprecated(f):
    def _deprecated(*args, **kwargs):
        message = "Method '%s' is deprecated and will be " \
            "removed in the next major version of django-oscar" \
            % f.__name__
        warnings.warn(message, DeprecationWarning, stacklevel=2)
        return f(*args, **kwargs)
    return _deprecated


def ignore_db_signal_failure(func):
    @wraps(func)
    def wrapped(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except OperationalError:
            logging.exception('Failed processing signal %s', func.__name__)
            return
    return wrapped
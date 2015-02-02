from django.db import models
from django.utils.translation import ugettext_lazy as _

from cobra.apps.accounts.abstract_models import AbstractProfile


class Profile(AbstractProfile):
    """
    Real profile model used
    """
    location = models.CharField(_('Location'), max_length=255, blank=True)

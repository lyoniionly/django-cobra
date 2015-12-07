from __future__ import absolute_import
import calendar
from collections import OrderedDict
import collections
from itertools import groupby
import json
from braces.views import JSONResponseMixin
import datetime
from django import http
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.core.urlresolvers import reverse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dates import MONTHS
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.generic import View

from cobra.core.loading import get_model, get_class
from django.utils.translation import ugettext_lazy as _, ugettext
from django.views import generic
from cobra.views.generic import ProjectView, OrganizationView
from cobra.core.utils import date_from_string, get_datetime_now, get_local_datetime_now
from cobra.core.calendar import get_calendar_first_weekday
from cobra.core.compat import get_user_model
from cobra.core.render import render_to_string

User = get_user_model()


class SummaryReportView(OrganizationView):
    def get(self, request, organization, *args, **kwargs):
        summary_user = get_object_or_404(User, username__iexact=self.kwargs['username'])

        context = {
            'active_nav': 'summary_report',
        }
        template_name = 'organization/summary/summary_report.html'
        return self.respond(template_name, context)

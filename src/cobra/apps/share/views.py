from __future__ import absolute_import

import logging
from braces.views import JSONResponseMixin, CsrfExemptMixin
from django import forms
from django.contrib import messages
from django.contrib.contenttypes.models import ContentType
from django.core.urlresolvers import reverse
from django.db.models import Q
from django.forms.models import modelform_factory
from django.http import HttpResponseRedirect
from django.utils.translation import ugettext_lazy as _
from django.views.generic import View
from cobra.apps.accounts.utils import get_user_by_pk

from cobra.views.generic import OrganizationView, missing_perm, TeamView
from cobra.core.loading import get_class, get_model
from cobra.core.permissions import can_create_teams, Permissions
from cobra.core.plugins import plugins

UserShare = get_model('share', 'UserShare')
WorkReport = get_model('summary', 'WorkReport')


class AddUserView(CsrfExemptMixin, JSONResponseMixin, View):

    def post(self, request, *args, **kwargs):
        entity_ids = request.POST.get('entityIds')
        entry_type = request.POST.get('entryType')
        module = request.POST.get('module')
        share_type = request.POST.get('shareType')
        user_ids = request.POST.get('sids')

        share_entrys = []

        if 'workreport' == module:
            work_report = WorkReport.objects.get(pk=entity_ids)
            user = get_user_by_pk(pk=int(user_ids))
            user_share, created = UserShare.objects.get_or_create(
                user=user, content_type=ContentType.objects.get_for_model(work_report),
                object_id=work_report.pk, share_type=share_type, entry_type=entry_type,
                module=module
            )
            share_entrys = [user_share.to_dict()]



        data = {
            'sids': user_ids,
            'entryType': entry_type,
            'shareEntrys': share_entrys,
        }
        return self.render_json_response(data)
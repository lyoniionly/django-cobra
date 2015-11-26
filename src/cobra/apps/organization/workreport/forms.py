# -*- coding: utf-8 -*-
from __future__ import absolute_import

from django import forms
from django.conf import settings
from django.utils.translation import ugettext_lazy as _

from cobra.core.loading import get_model, get_class
from cobra.forms.fields import UserField

DailyDeadline = get_model('workreport', 'DailyDeadline')


class DailyReportDeadlineForm(forms.ModelForm):

    def __init__(self, organization, *args, **kwargs):
        try:
            instance = DailyDeadline.objects.get(organization=organization)
        except DailyDeadline.DoesNotExist:
            deadline = settings.COBRA_WORKREPORT_DAILY_DEADLINE
            instance = DailyDeadline(organization=organization, deadline_time=deadline)
        kwargs['instance'] = instance

        super(DailyReportDeadlineForm, self).__init__(*args, **kwargs)

    class Meta:
        fields = ('deadline_time',)
        model = DailyDeadline
        widgets = {
            'deadline_time': forms.TimeInput(format='%H:%M', attrs={'class':'form-control'}),
        }
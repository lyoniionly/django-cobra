# -*- coding: utf-8 -*-
from __future__ import absolute_import

from django import forms
from django.utils.translation import ugettext_lazy as _

from cobra.core.loading import get_model

Organization = get_model('organization', 'Organization')


class OrganizationCreateForm(forms.ModelForm):
    name = forms.CharField(label=_('Organization Name'), max_length=200,
        widget=forms.TextInput(attrs={'placeholder': _('My Company')}))

    class Meta:
        fields = ('name',)
        model = Organization

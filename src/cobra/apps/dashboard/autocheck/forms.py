from __future__ import absolute_import
from django import forms
from django.utils.translation import ugettext_lazy as _
from xlrd import open_workbook
from cobra.apps.dashboard.autocheck.utils import diff_sheet


class ExcelDiffForm(forms.Form):
    excel_from = forms.FileField(help_text=_('The original excel to diff'))
    excel_to = forms.FileField(help_text=_('The other excel to diff'))

    def diff(self):
        excel_from = self.cleaned_data['excel_from']
        excel_to = self.cleaned_data['excel_to']
        wb1 = open_workbook(file_contents=excel_from.read())
        wb2 = open_workbook(file_contents=excel_to.read())

        report = diff_sheet(wb1.sheet_by_index(2), wb2.sheet_by_index(2))
        return report
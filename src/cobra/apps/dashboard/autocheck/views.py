from __future__ import absolute_import
from django.core.urlresolvers import reverse_lazy
from xlrd import open_workbook
from .utils import diff_sheet
from cobra.core.loading import get_model, get_class
from django.utils.translation import ugettext_lazy as _
from django.views import generic

ExcelDiffForm = get_class('dashboard.autocheck.forms', 'ExcelDiffForm')


class IndexView(generic.FormView):
    template_name = 'dashboard/autocheck/index.html'
    form_class = ExcelDiffForm
    success_url = reverse_lazy('dashboard:autocheck-index')

    def get_context_data(self, *args, **kwargs):
        ctx = super(IndexView, self).get_context_data(*args, **kwargs)
        ctx.update(kwargs)
        ctx.update({'active_tab':'autocheck'})
        return ctx

    def form_valid(self, form):
        # This method is called when valid form data has been POSTed.
        # It should return an HttpResponse.
        e_f = form.files.get('excel_from')
        e_t = form.files.get('excel_to')
        df_report = form.diff()
        return self.render_to_response(self.get_context_data(form=form, report=df_report, e_f=e_f.name, e_t=e_t.name))

    # def post(self, request, *args, **kwargs):
    #     excel1 = request.FILES.get('excel1')
    #     excel2 = request.FILES.get('excel2')
    #     wb1 = open_workbook(file_contents=excel1.read())
    #     wb2 = open_workbook(file_contents=excel2.read())
    #
    #     report = diff_sheet(wb1.sheet_by_index(1), wb2.sheet_by_index(1))
    #     s = 1


from braces.views import JSONResponseMixin
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from cobra.views.generic import OrganizationView
from cobra.core.dates import epoch
from cobra.core.loading import get_model

from cobra.apps.summary.constants import WORK_REPORT_TYPE_YEAR, WORK_REPORT_TYPE_HALF_YEAR, WORK_REPORT_TYPE_WEEK, \
    WORK_REPORT_TYPE_MONTH, WORK_REPORT_TYPE_SEASON
from cobra.apps.accounts.utils import get_user_by_pk

WorkReport = get_model('summary', 'WorkReport')


class AjaxView(JSONResponseMixin, OrganizationView):

    def get(self, request, organization, *args, **kwargs):
        user_id = request.GET.get('workReport.creator.userId')
        serial_number = request.GET.get('workReport.serialNumber')
        type = request.GET.get('workReport.type')
        year = request.GET.get('workReport.year')

        user = get_user_by_pk(pk=int(user_id))
        work_report = None
        if type==WORK_REPORT_TYPE_YEAR or type==WORK_REPORT_TYPE_HALF_YEAR:
            work_reports = WorkReport.objects.filter(
                organization=organization,
                owner=user,
                type=type,
                year=int(year)
            )
            if work_reports:
                work_report = work_reports[0]
        elif type == WORK_REPORT_TYPE_WEEK or type==WORK_REPORT_TYPE_MONTH or type==WORK_REPORT_TYPE_SEASON:
            work_reports = WorkReport.objects.filter(
                organization=organization,
                owner=user,
                type=type,
                year=int(year),
                serial_number=serial_number
            )
            if work_reports:
                work_report = work_reports[0]
        else:
            work_report = None

        employee = {
            'tenantKey': 'TTN1KL35CQ',
            'username': user.username,
            'name': user.get_full_name(),
            'email': 'asfd@af.com',
            'status': 'normal',
            'department': {},
            'authorities': [{'authority': 'ROLE_ADMIN'}],
            'activeDate': epoch(user.date_joined, msec=True),
            'admin': True,
            'id': int(user_id),
            'employeeId': int(user_id)
        }
        data = {
            'employee': employee,
            'unReadCount': 0,
            'commentMeCount': 0,
            'replayMeCount': 0,
            'pageNo': 1,
            'pageSize': 10
        }
        if work_report:
            data.update({
                'workReport': work_report.to_dict()
            })
        return self.render_json_response(data)


class AjaxWorkreportView(JSONResponseMixin, OrganizationView):

    def post(self, request, organization, *args, **kwargs):
        user_id = request.POST.get('workReport.creator.userId')
        serial_number = request.POST.get('workReport.serialNumber')
        type = request.POST.get('workReport.type')
        year = request.POST.get('workReport.year')
        content = request.POST.get('workReport.effect-content')
        summary = request.POST.get('workReport.experience-summary')
        plan = request.POST.get('workReport.work-plan')
        attachmentLinkIds = request.POST.get('ids')

        user = get_user_by_pk(pk=int(user_id))

        wr_kwargs = {
            'organization': organization,
            'owner': user,
            'type': type,
            'year': int(year)
        }
        try:
            wr_kwargs['serial_number'] = int(serial_number)
        except Exception as e:
            pass

        if content is not None:
            wr_kwargs['content'] = content
        if summary is not None:
            wr_kwargs['summary'] = summary
        if plan is not None:
            wr_kwargs['plan'] = plan

        workreport = WorkReport.objects.create(**wr_kwargs)
        data = {
            'workReport': workreport.to_dict(),
            'unReadCount': 0,
            'commentMeCount': 0,
            'replayMeCount': 0,
            'pageNo': 1,
            'pageSize': 10
        }
        return self.render_json_response(data)


class AjaxUpdateWorkreportView(JSONResponseMixin, OrganizationView):

    def post(self, request, organization, pk, *args, **kwargs):
        workreport = get_object_or_404(WorkReport, pk=pk)
        content = request.POST.get('workReport.effect-content')
        summary = request.POST.get('workReport.experience-summary')
        plan = request.POST.get('workReport.work-plan')
        if content is not None:
            workreport.content = content
        if summary is not None:
            workreport.summary = summary
        if plan is not None:
            workreport.plan = plan
        workreport.save()
        data = {
            'workReport': workreport.to_dict(),
            'unReadCount': 0,
            'commentMeCount': 0,
            'replayMeCount': 0,
            'pageNo': 1,
            'pageSize': 10
        }
        return self.render_json_response(data)

from braces.views import JSONResponseMixin
from cobra.apps.accounts.utils import get_user_by_pk
from cobra.views.generic import OrganizationView
from cobra.core.dates import epoch


class AjaxView(JSONResponseMixin, OrganizationView):

    def get(self, request, organization, *args, **kwargs):
        user_id = request.GET.get('workReport.creator.userId')
        serial_number = request.GET.get('serialNumber')
        type = request.GET.get('workReport.type', 'week')
        year = request.GET.get('workReport.year')

        user = get_user_by_pk(pk=int(user_id))
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
        return self.render_json_response(data)

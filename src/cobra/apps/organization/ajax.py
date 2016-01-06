from braces.views import JSONResponseMixin
from django.db.models import Q
from django.shortcuts import get_object_or_404
from cobra.apps.accounts.utils import get_user_by_pk, get_user_info

from cobra.views.generic import OrganizationView
from cobra.core.loading import get_model

OrganizationMember = get_model('organization', 'OrganizationMember')
OrganizationDepartment = get_model('organization', 'OrganizationDepartment')


class OrganizationMembersSubordinatesView(JSONResponseMixin, OrganizationView):

    def get(self, request, organization, user_id, *args, **kwargs):
        username = request.GET.get('userName', '')
        user = get_user_by_pk(pk=int(user_id))

        queryset = OrganizationMember.objects.filter(
            Q(user__isnull=False) & Q(user__is_active=True),
            organization=organization,
        ).exclude(user=user)

        if username:
            queryset = queryset.filter(user__first_name__contains=username)

        queryset = queryset.select_related('user')

        queryset = sorted(queryset, key=lambda x: x.user.get_display_name() or x.email)

        data = {
            'user': get_user_info(user),
            'subordinates': [get_user_info(m.user) for m in queryset]
        }
        return self.render_json_response(data)


class OrganizationSearchSuggestionView(JSONResponseMixin, OrganizationView):

    def get(self, request, organization, *args, **kwargs):
        keywords = request.GET.get('keywords', '')
        search_type = request.GET.get('searchType', '')

        data = {
            'keywords': keywords,
            'searchType': search_type,
        }

        if search_type == 'employee':
            queryset = OrganizationMember.objects.filter(
                Q(user__isnull=False) & Q(user__is_active=True),
                organization=organization,
            )
            if keywords:
                queryset = queryset.filter(user__first_name__contains=keywords)
            queryset = queryset.select_related('user')
            queryset = sorted(queryset, key=lambda x: x.user.get_display_name() or x.email)
            data.update({
                'loadCount': False,
                'privacy': True,
                'employees': [get_user_info(m.user) for m in queryset]
            })
        elif search_type == 'department':
            departments = OrganizationDepartment.objects.filter(organization=organization)
            if keywords:
                departments = departments.filter(name__contains=keywords)
            departments = departments[0:10]
            data.update({
                'loadCount': False,
                'privacy': True,
                'departments': [d.get_node_obj() for d in departments]
            })

        return self.render_json_response(data)


class OrganizationDepartmentsView(JSONResponseMixin, OrganizationView):

    def get(self, request, organization, *args, **kwargs):
        departments = OrganizationDepartment.objects.filter(
            organization=organization
        )

        data = {
            'nodes': [d.to_dict() for d in departments]
        }
        return self.render_json_response(data)


class OrganizationDepartmentView(JSONResponseMixin, OrganizationView):

    def get(self, request, organization, department_id, *args, **kwargs):
        department = OrganizationDepartment.objects.get(pk=department_id)

        data = {
            'department': department.get_node_obj(),
            'nodes': [],
            'id': department_id
        }
        return self.render_json_response(data)
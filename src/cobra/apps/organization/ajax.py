from braces.views import JSONResponseMixin
from django.db.models import Q
from django.shortcuts import get_object_or_404
from cobra.apps.accounts.utils import get_user_by_pk, get_user_info

from cobra.views.generic import OrganizationView
from cobra.core.loading import get_model
from cobra.core.utils import multi_get_letter

OrganizationMember = get_model('organization', 'OrganizationMember')
OrganizationDepartment = get_model('organization', 'OrganizationDepartment')
OrganizationDepartmentMember = get_model('organization', 'OrganizationDepartmentMember')


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
        ).order_by('display_order')

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


class OrganizationDepartmentDeleteView(JSONResponseMixin, OrganizationView):

    def post(self, request, organization, *args, **kwargs):
        department_id = request.POST.get('department.id', '')
        department_parent_id = request.POST.get('department.parent', '')
        msg = ''
        if department_parent_id:
            department = OrganizationDepartment.objects.get(pk=department_id)
            department_parent = OrganizationDepartment.objects.get(pk=department_parent_id)
            dep_children = department.get_children()
            for c in dep_children:
                c.move_to(department_parent, position='last-child')
            department.delete()
            OrganizationDepartment.objects.rebuild()
            msg = 'Delete successfully!'
        else:
            msg = 'Can not delete this department, it is the root of your org!'
        data = {
            'message': msg
        }
        return self.render_json_response(data)


class OrganizationMemberPinyinIndexsView(JSONResponseMixin, OrganizationView):

    def get(self, request, organization, *args, **kwargs):
        department_id = request.GET.get('member.department', '')
        member_status = request.GET.get('member.status', '')
        is_contains_sub = request.GET.get('isContainsSub', '')
        is_root_department = False
        if department_id:
            department = OrganizationDepartment.objects.get(pk=department_id)
            if department.parent:
                department_members = OrganizationDepartmentMember.objects.filter(department=department)
                pinyin_indexs = [multi_get_letter(dm.user.get_full_name())[0] for dm in department_members]
            else:
                is_root_department = True
        else:
            is_root_department = True
        if is_root_department:
            org_members = OrganizationMember.objects.get_members(organization)
            pinyin_indexs = [multi_get_letter(om.user.get_full_name())[0] for om in org_members]

        data = {
            'isContainsSub': is_contains_sub,
            'isAll': False,
            'countUsers': 0,
            'countAdmins': 0,
            'indexs': pinyin_indexs
        }
        return self.render_json_response(data)


class OrganizationMemberListView(JSONResponseMixin, OrganizationView):

    def get(self, request, organization, *args, **kwargs):
        department_id = request.GET.get('member.department', '')
        member_status = request.GET.get('member.status', '')
        member_username = request.GET.get('member.username', '')
        member_email = request.GET.get('member.email', '')
        member_index = request.GET.get('member.index', '')
        is_contains_sub = request.GET.get('isContainsSub', '')
        page_num = request.GET.get('pageNo', '')
        page_size = request.GET.get('pageSize', '')
        group_id = request.GET.get('groupId', '')
        is_root_department = False
        if department_id:
            department = OrganizationDepartment.objects.get(pk=department_id)
            if department.parent:
              department_members = OrganizationDepartmentMember.objects.filter(department=department)
              users = [dm.user for dm in department_members]
            else:
              is_root_department = True
        else:
            is_root_department = True
        if is_root_department:
            org_members = OrganizationMember.objects.get_members(organization)
            users = [om.user for om in org_members]

        data = {
            'isContainsSub': is_contains_sub,
            'isAll': False,
            'countUsers': 0,
            'countAdmins': 0,
            'groupId': group_id,
            'page': {
                'pageNo': page_num,
                'pageSize': page_size,
                'totalCount': 4,
                'totalPages': 1,
                'hasNext': False,
                'nextPage': 1,
                'hasPre': False,
                'prePage': 1,
                'first': 1,
                'result': [get_user_info(u, organization) for u in users]
            }
        }
        return self.render_json_response(data)


class OrganizationMemberProfileView(JSONResponseMixin, OrganizationView):

    def get(self, request, organization, user_id, *args, **kwargs):
        user = get_user_by_pk(pk=int(user_id))


        data = {
            'employee': get_user_info(user, organization)
        }
        return self.render_json_response(data)
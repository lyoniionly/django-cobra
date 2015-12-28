from braces.views import JSONResponseMixin
from django.db.models import Q
from django.shortcuts import get_object_or_404
from cobra.apps.accounts.utils import get_user_by_pk, get_user_info

from cobra.views.generic import OrganizationView
from cobra.core.loading import get_model

OrganizationMember = get_model('organization', 'OrganizationMember')


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
        username = request.GET.get('keywords', '')
        search_type = request.GET.get('searchType', '')

        queryset = OrganizationMember.objects.filter(
            Q(user__isnull=False) & Q(user__is_active=True),
            organization=organization,
        )

        if username:
            queryset = queryset.filter(user__first_name__contains=username)

        queryset = queryset.select_related('user')

        queryset = sorted(queryset, key=lambda x: x.user.get_display_name() or x.email)

        data = {
            'loadCount': False,
            'keywords': username,
            'searchType': search_type,
            'privacy': True,
            'employees': [get_user_info(m.user) for m in queryset]
        }
        return self.render_json_response(data)
from __future__ import absolute_import

from django.conf import settings

from cobra.models import BaseManager
from cobra.core.loading import get_model
from .utils import OrganizationStatus


class OrganizationManager(BaseManager):
    def get_for_user(self, user, access=None):
        """
        Returns a set of all organizations a user has access to.

        Each <Organization> returned has an ``member_type`` attribute which
        holds the OrganizationMemberType value.
        """
        OrganizationMember = get_model('organization', 'OrganizationMember')
        OrganizationMemberType = get_model('organization', 'OrganizationMemberType')

        results = []

        if not user.is_authenticated():
            return results

        if settings.COBRA_PUBLIC and access is None:
            qs = self.filter(status=OrganizationStatus.VISIBLE)
            for org in qs:
                org.member_type = OrganizationMemberType.MEMBER
                results.append(org)
        else:
            qs = OrganizationMember.objects.filter(
                user=user,
                organization__status=OrganizationStatus.VISIBLE,
            ).select_related('organization')
            if access is not None:
                # if we're requesting specific access the member *must* have
                # global access to teams
                qs = qs.filter(
                    type__lte=access,
                    has_global_access=True,
                )

            for om in qs:
                org = om.organization
                org.member_type = om.type
                results.append(org)

        return results
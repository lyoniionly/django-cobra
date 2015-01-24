# -*- coding: utf-8 -*-
from cobra.core.loading import is_model_registered

from .abstract_models import *  # noqa

__all__ = []


if not is_model_registered('organization', 'Organization'):
    class Organization(AbstractOrganization):
        pass

    __all__.append('Organization')


if not is_model_registered('organization', 'OrganizationMember'):
    class OrganizationMember(AbstractOrganizationMember):
        pass

    __all__.append('OrganizationMember')

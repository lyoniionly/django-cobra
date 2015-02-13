# -*- coding: utf-8 -*-
from __future__ import absolute_import
from cobra.core.loading import is_model_registered

from .abstract_models import *  # noqa

__all__ = []


if not is_model_registered('svnkit', 'Repository'):
    class Repository(AbstractRepository):
        pass

    __all__.append('Repository')


if not is_model_registered('svnkit', 'Changeset'):
    class Changeset(AbstractChangeset):
        pass

    __all__.append('Changeset')


if not is_model_registered('svnkit', 'Change'):
    class Change(AbstractChange):
        pass

    __all__.append('Change')


if not is_model_registered('svnkit', 'Node'):
    class Node(AbstractNode):
        pass

    __all__.append('Node')


if not is_model_registered('svnkit', 'Property'):
    class Property(AbstractProperty):
        pass

    __all__.append('Property')


if not is_model_registered('svnkit', 'Content'):
    class Content(AbstractContent):
        pass

    __all__.append('Content')


from __future__ import absolute_import, print_function

from .manager import OptionsManager

default_manager = OptionsManager()

# expose public API
get = default_manager.get
set = default_manager.set
delete = default_manager.delete

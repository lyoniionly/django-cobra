
from __future__ import absolute_import

from sudo.middleware import SudoMiddleware as BaseSudoMiddleware

from cobra.core.constants import EMPTY_PASSWORD_VALUES


class SudoMiddleware(BaseSudoMiddleware):
    def has_sudo_privileges(self, request):
        # Users without a password are assumed to always have sudo powers
        user = request.user
        if user.is_authenticated() and user.password in EMPTY_PASSWORD_VALUES:
            return True

        return super(SudoMiddleware, self).has_sudo_privileges(request)

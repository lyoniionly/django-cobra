
class TeamStatus(object):
    VISIBLE = 0
    PENDING_DELETION = 1
    DELETION_IN_PROGRESS = 2


class TeamMemberType(object):
    ADMIN = 0
    MEMBER = 50
    BOT = 100
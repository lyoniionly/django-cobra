class OrganizationStatus(object):
    VISIBLE = 0
    PENDING_DELETION = 1
    DELETION_IN_PROGRESS = 2


class OrganizationMemberType(object):
    OWNER = 0
    ADMIN = 25
    MEMBER = 50
    BOT = 100



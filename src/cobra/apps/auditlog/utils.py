class AuditLogEntryEvent(object):
    MEMBER_INVITE = 1
    MEMBER_ADD = 2
    MEMBER_ACCEPT = 3
    MEMBER_EDIT = 4
    MEMBER_REMOVE = 5

    ORG_ADD = 10
    ORG_EDIT = 11

    TEAM_ADD = 20
    TEAM_EDIT = 21
    TEAM_REMOVE = 22

    PROJECT_ADD = 30
    PROJECT_EDIT = 31
    PROJECT_REMOVE = 32
    PROJECT_SET_PUBLIC = 33
    PROJECT_SET_PRIVATE = 34

    TAGKEY_REMOVE = 40

    PROJECTKEY_ADD = 50
    PROJECTKEY_EDIT = 51
    PROJECTKEY_REMOVE = 52
    PROJECTKEY_ENABLE = 53
    PROJECTKEY_DISABLE = 53

    TEMPLATE = {
        ORG_ADD: 'created organization %(organization)s',
        ORG_EDIT : 'edited organization %(organization)s',

        TEAM_ADD: 'created team %(team)s on organization %(organization)s',
        TEAM_EDIT : 'edited team %(team)s on organization %(organization)s',
        TEAM_REMOVE : 'removed team %(team)s on organization %(organization)s',

        PROJECT_ADD: 'created project %(project)s on organization %(organization)s',
        PROJECT_EDIT: 'edited project %(project)s on organization %(organization)s',
        PROJECT_REMOVE: 'removed project %(project)s on organization %(organization)s',
        PROJECT_SET_PUBLIC: 'set project %(project)s pulic on organization %(organization)s',
        PROJECT_SET_PRIVATE: 'set project %(project)s private on organization %(organization)s',
    }

    ICON_FONTS = {
        MEMBER_INVITE: 'glyphicon glyphicon-user',
        MEMBER_ADD: 'glyphicon glyphicon-user',
        MEMBER_ACCEPT: 'glyphicon glyphicon-user',
        MEMBER_EDIT: 'glyphicon glyphicon-edit',
        MEMBER_REMOVE: 'glyphicon glyphicon-user',

        ORG_ADD: 'glyphicon glyphicon-plus',
        ORG_EDIT: 'glyphicon glyphicon-edit',

        TEAM_ADD: 'glyphicon glyphicon-plus',
        TEAM_EDIT: 'glyphicon glyphicon-edit',
        TEAM_REMOVE: 'glyphicon glyphicon-remove-circle',

        PROJECT_ADD: 'glyphicon glyphicon-plus',
        PROJECT_EDIT: 'glyphicon glyphicon-edit',
        PROJECT_REMOVE: 'glyphicon glyphicon-remove-circle',
        PROJECT_SET_PUBLIC: '',
        PROJECT_SET_PRIVATE: 'glyphicon glyphicon-lock',
    }
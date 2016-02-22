from cobra.core.loading import get_model
from cobra.core import json


class UserConfig(object):

    default_config = {
        'guide.task.participant': '1',
        'guide.document.share': '1',
        'guide.customer.share': '1',
        'guide.workflow.operation': '1',
        'guide.workflow.createform': '1',
        'order.task.search': 'default',
        'order.task.searchDirection': 'DESC',
        'portal.workdyna': 'subordinates-task',
        'system.menu.display':'',
        'viewState.task': 'list',
        'guide.biaoge.showintro': '1',
        'workreport.push.set': '1',
        'agenda.push.set': '1'
    }

    def __init__(self, user):
        self.__user_config = self.__build_user_config(user)

    def __build_user_config(self, user):
        UserOption = get_model('option', 'UserOption')
        u_c = {}
        for k, v in self.default_config.items():
            u_c[k] = UserOption.objects.get_value(user, None, k, v)
        return u_c

    def to_python(self):
        configs = []
        for k, v in self.__user_config.items():
            m = {
                'configKey': k,
                'configValue': v
            }
            configs.append(m)
        return configs

    def to_json(self):
        return json.dumps(self.to_python())
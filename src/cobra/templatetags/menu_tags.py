from django import template
from django.utils.safestring import SafeString
from cobra.core.loading import get_model

## Django 1.5+ compat
try:
    import json
except ImportError:  # pragma: no cover
    from django.utils import simplejson as json

register = template.Library()

Menu = get_model('menu', 'Menu')
UserMenu = get_model('menu', 'UserMenu')


@register.assignment_tag
def menu_json(user):
    menus = []
    user_menus = UserMenu.objects.filter(user=user)
    if user_menus:
        menus = [m.to_dict() for m in user_menus]
    else:
        user_menus = Menu.objects.all()
        for m in user_menus:
            menu_dict = m.to_dict()
            menu_dict.update({'empid': user.pk})
            menus.append(menu_dict)
    return SafeString(json.dumps(menus))


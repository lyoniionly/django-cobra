from braces.views import JSONResponseMixin
from django.db.models import Q
from django.views.generic import View
from cobra.apps.accounts.utils import get_user_by_pk, get_user_info

from cobra.core.loading import get_model

Menu = get_model('menu', 'Menu')
UserMenu = get_model('menu', 'UserMenu')


class MenuMemberQueryView(JSONResponseMixin, View):

    def get(self, request, *args, **kwargs):
        user = request.user
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

        data = {
            'userId': user.pk,
            'empmenus': menus
        }
        return self.render_json_response(data)


class MenuMemberResetView(JSONResponseMixin, View):

    def post(self, request, *args, **kwargs):
        user = request.user
        UserMenu.objects.filter(user=user).delete()
        menus = []
        user_menus = Menu.objects.all()
        for m in user_menus:
            menu_dict = m.to_dict()
            menu_dict.update({'empid': user.pk})
            menus.append(menu_dict)

        data = {
            'userId': user.pk,
            'empmenus': menus
        }
        return self.render_json_response(data)


class MenuMemberUpdateStatusView(JSONResponseMixin, View):

    def post(self, request, *args, **kwargs):
        user = request.user
        menu_id = request.POST.get('menuId')
        menu_status = request.POST.get('menuStatus')
        count = UserMenu.objects.filter(user=user).count()
        if count:
            menu = Menu.objects.get(pk=menu_id)
            obj, created = UserMenu.objects.update_or_create(
                user=user, menu=menu, defaults={'is_used': int(menu_status)}
            )
        else:
            menus = Menu.objects.all()
            for m in menus:
                if m.pk == menu_id:
                    is_used = int(menu_id)
                else:
                    is_used = m.is_used
                UserMenu.objects.create(
                    menu=m, user=user, order=m.order, is_used=is_used
                )
        data = {
            'userId': user.pk,
        }
        return self.render_json_response(data)


class MenuMemberUpdateOrderView(JSONResponseMixin, View):

    def post(self, request, *args, **kwargs):
        user = request.user
        menu_ids = request.POST.get('menuIds')
        menu_orders = request.POST.get('menuOrders')
        order_map = zip(menu_ids.split(','), menu_orders.split(','))
        count = UserMenu.objects.filter(user=user).count()
        if count:
            for menu_id, order in order_map:
                menu = Menu.objects.get(pk=menu_id)
                user_menu = UserMenu.objects.get(menu=menu, user=user)
                user_menu.order = order
                user_menu.save()
        else:
            for menu_id, order in order_map:
                menu = Menu.objects.get(pk=menu_id)
                UserMenu.objects.create(
                    menu=menu, user=user, order=order, is_used=menu.is_used
                )
        data = {
            'userId': user.pk,
        }
        return self.render_json_response(data)

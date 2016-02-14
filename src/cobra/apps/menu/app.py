from django.conf.urls import url

from cobra.core.application import Application
from cobra.core.loading import get_class


class MenuApplication(Application):
    name = 'menu'

    menu_member_query_view = get_class('menu.ajax', 'MenuMemberQueryView')
    menu_member_reset_view = get_class('menu.ajax', 'MenuMemberResetView')
    menu_member_update_status_view = get_class('menu.ajax', 'MenuMemberUpdateStatusView')
    menu_member_update_order_view = get_class('menu.ajax', 'MenuMemberUpdateOrderView')

    def get_urls(self):
        urls = [

            #ajax
            url(r'^ajax/member/queryMenus.json$', self.menu_member_query_view.as_view(),
                name='ajax-member-query'),
            url(r'^ajax/member/resetMenuSetting.json$', self.menu_member_reset_view.as_view(),
                name='ajax-member-reset'),
            url(r'^ajax/member/updateMemberCustMenuStatus.json$', self.menu_member_update_status_view.as_view(),
                name='ajax-member-update-status'),
            url(r'^ajax/member/updateMemberCustMenuOrder.json$', self.menu_member_update_order_view.as_view(),
                name='ajax-member-update-order'),
        ]
        return self.post_process_urls(urls)


application = MenuApplication()

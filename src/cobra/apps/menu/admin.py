from django.contrib import admin
from cobra.core.loading import get_model

Menu = get_model('menu', 'Menu')
UserMenu = get_model('menu', 'UserMenu')


admin.site.register(Menu)
admin.site.register(UserMenu)

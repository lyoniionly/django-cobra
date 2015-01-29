from django.contrib import admin
from cobra.core.loading import get_model

User = get_model('accounts', 'User')

admin.site.register(User)

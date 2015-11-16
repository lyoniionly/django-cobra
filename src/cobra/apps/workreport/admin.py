from django.contrib import admin
from cobra.core.loading import get_model

DailyReport = get_model('workreport', 'DailyReport')
DailyFinishedTask = get_model('workreport', 'DailyFinishedTask')
DailyDeadline = get_model('workreport', 'DailyDeadline')

admin.site.register(DailyReport)
admin.site.register(DailyFinishedTask)
admin.site.register(DailyDeadline)


from datetime import datetime
from django.conf import settings


from cobra.core.loading import get_model


def get_daily_report_deadline(organization):
    DailyDeadline = get_model('workreport', 'DailyDeadline')
    try:
        dd = DailyDeadline.objects.get(organization=organization)
        deadline = str(dd.deadline_time)
    except Exception as e:
        deadline = settings.COBRA_WORKREPORT_DAILY_DEADLINE

    return deadline

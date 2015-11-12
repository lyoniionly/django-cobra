from django.conf import settings

def get_calendar_first_weekday():
    if getattr(settings, "LANGUAGE_CODE", "en-us").lower() == 'zh-cn': # chinese
        return 0
    else:
        return 6
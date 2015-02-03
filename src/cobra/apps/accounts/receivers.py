from allauth.account.signals import user_logged_in
from django.dispatch import receiver

from cobra.core.loading import get_model

UserOption = get_model('option', 'UserOption')

@receiver(user_logged_in, dispatch_uid="set_language_on_logon", weak=False)
def set_language_on_logon(request, user, **kwargs):
    language = UserOption.objects.get_value(
        user=user,
        project=None,
        key='language',
        default=None,
    )
    if language and hasattr(request, 'session'):
        request.session['django_language'] = language
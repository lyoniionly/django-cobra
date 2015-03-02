import datetime

from django.conf import settings
from django.utils import timezone


def autosync_repositories(view_func):
    def new_view_func(request, *args, **kwargs):
        project = kwargs.get('project')
        last_sync_check = project.repository.last_synced

        if settings.COBRA_SVNKIT_AUTO_SYNC:
            sync_td = datetime.timedelta(0, settings.COBRA_SVNKIT_SYNC_INTERVAL)
            if timezone.now() - last_sync_check > sync_td:
                project.repository.sync()

        return view_func(request, *args, **kwargs)

    new_view_func.__name__ = view_func.__name__
    new_view_func.__dict__ = view_func.__dict__
    new_view_func.__doc__ = view_func.__doc__
    new_view_func.__module__ = view_func.__module__

    return new_view_func

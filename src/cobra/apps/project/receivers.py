from django.dispatch import receiver
from django.db.models.signals import post_save

from cobra.core.decorators import ignore_db_signal_failure
from cobra.core.loading import get_model

Project = get_model('project', 'Project')
ProjectKey = get_model('project', 'ProjectKey')


@receiver(post_save, sender=Project, dispatch_uid="create_keys_for_project", weak=False)
@ignore_db_signal_failure
def create_keys_for_project(instance, created, **kwargs):
    if not created or kwargs.get('raw'):
        return

    if not ProjectKey.objects.filter(project=instance, user__isnull=True).exists():
        ProjectKey.objects.create(
            project=instance,
        )
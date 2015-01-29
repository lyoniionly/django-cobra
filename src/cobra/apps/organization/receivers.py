from django.dispatch import receiver
from django.db.models.signals import post_save

from cobra.core.decorators import ignore_db_signal_failure
from cobra.core.loading import get_model, get_class

Organization = get_model('organization', 'Organization')
OrganizationMemberType = get_class('organization.utils', 'OrganizationMemberType')

@receiver(post_save, sender=Organization, dispatch_uid="create_org_member_for_owner", weak=False)
@ignore_db_signal_failure
def create_org_member_for_owner(instance, created, **kwargs):
    if not created:
        return

    if not instance.owner:
        return

    instance.member_set.get_or_create(
        user=instance.owner,
        type=OrganizationMemberType.OWNER,
        has_global_access=True,
    )

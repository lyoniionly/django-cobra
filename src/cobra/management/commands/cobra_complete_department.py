import logging

from cobra.core.loading import get_model
from django.core.management.base import BaseCommand

Organization = get_model('organization', 'Organization')
OrganizationDepartment = get_model('organization', 'OrganizationDepartment')

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """
    Command to complete org department root
    """
    help = "Complete org department root"

    def handle(self, *args, **options):
        """
        """
        organizations = Organization.objects.all()
        for org in organizations:
            if not OrganizationDepartment.objects.filter(
                organization=org, parent__isnull=True
            ).exists():
                OrganizationDepartment.objects.create(
                    name=org.name, organization=org
                )
                print(org.name + " department is created")
        print('All org has department root now!')

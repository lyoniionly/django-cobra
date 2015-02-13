import datetime

from django.conf import settings
from django.core import management
from django.utils.translation import ugettext as _
from cobra.core.loading import get_model

Node = get_model('svnkit', 'Node')


class Command(management.BaseCommand):
    help = _('Clean up expired cached files')
    
    def handle(self, *args, **options):
        threshold = datetime.datetime.now() - datetime.timedelta(
            0, settings.SVNLIT_CACHE_TIMEOUT)
        nodes = Node.objects.filter(cached__lte=threshold)
        if nodes.count():
            print _('Deleting %s nodes...') % nodes.count()
            nodes.delete()

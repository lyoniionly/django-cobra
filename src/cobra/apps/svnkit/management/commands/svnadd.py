import optparse

from django.core import management
from django.utils.translation import ugettext as _

from cobra.core.loading import get_model

Repository = get_model('svnkit', 'Repository')


class Command(management.BaseCommand):
    help = _('Add a repository')
    args = _('<label> <root>')

    option_list = (
        optparse.make_option(
            '--uri', action='store', dest='uri', default='',
            help=_('Externally facing URI for the repository, if available.')),
        optparse.make_option(
            '--private', action='store_true', dest='private',
            help=_('If browsing the repository requires authentication.')),
        optparse.make_option(
            '--username', action='store', dest='username', default='',
            help=_('Username to use when connecting to the repository.')),
        optparse.make_option(
            '--password', action='store', dest='password', default='',
            help=_('Password to use when connecting to the repository.')),
    ) + management.BaseCommand.option_list

    def handle(self, *args, **options):
        if not len(args) == 2:
            raise management.CommandError(
                _('wrong number of arguments, label and root required'))

        label, root = args

        Repository.objects.create(
            label=label, root=root, uri=options['uri'],
            username=options['username'], password=options['password'],
            is_private=options['private'] or False)
        
        print _('Repository %s added') % label

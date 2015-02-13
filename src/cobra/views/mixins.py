from django.conf import settings
from cobra.core.constants import EVENTS_PER_PAGE
from cobra.core.loading import get_model

class ExtraContextMixin(object):

    def get_context_data(self, **kwargs):
        from cobra.core.plugins import plugins
        Team = get_model('team', 'Team')

        context = {
            'EVENTS_PER_PAGE': EVENTS_PER_PAGE,
            'URL_PREFIX': settings.COBRA_URL_PREFIX,
            'PLUGINS': plugins,
            'ALLOWED_HOSTS': settings.ALLOWED_HOSTS,
        }

        if kwargs and 'team' in kwargs:
            team = kwargs['team']
            context['organization'] = team.organization
        else:
            team = None

        if (not kwargs or 'TEAM_LIST' not in kwargs) and team:
            context['TEAM_LIST'] = Team.objects.get_for_user(
                organization=team.organization,
                user=self.request.user,
                with_projects=True,
            )
        kwargs.update(context)
        return super(ExtraContextMixin, self).get_context_data(**kwargs)
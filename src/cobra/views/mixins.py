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

        # if kwargs and 'team' in kwargs:
        #     team = kwargs['team']
        #     context['organization'] = team.organization
        # else:
        #     team = None
        #
        # if (not kwargs or 'TEAM_LIST' not in kwargs) and team:
        #     context['TEAM_LIST'] = Team.objects.get_for_user(
        #         organization=team.organization,
        #         user=self.request.user,
        #         with_projects=True,
        #     )
        context['organization'] = self.organization
        context['team'] = getattr(self, 'team', self.project.team)
        context['project'] = self.project
        context['repository'] = self.repository
        context['active_nav'] = 'code'
        context['TEAM_LIST'] = Team.objects.get_for_user(
                organization=self.organization,
                user=self.request.user,
                with_projects=True,
        )

        kwargs.update(context)
        return super(ExtraContextMixin, self).get_context_data(**kwargs)


class PageTitleMixin(object):
    """
    Passes page_title, active_nav and active_tab into context, which makes it quite useful
    for the accounts views.

    ----------------------------------------
    |  active_nav                          |
    |______________________________________|
    |              |                       |
    |              |                       |
    |  active_tab  |                       |
    |              |                       |
    |              |                       |
    |              |                       |
    |--------------------------------------/

    Dynamic page titles are possible by overriding get_page_title.
    """
    page_title = None
    active_nav = None
    active_tab = None

    # Use a method that can be overridden and customised
    def get_page_title(self):
        return self.page_title

    def get_context_data(self, **kwargs):
        ctx = super(PageTitleMixin, self).get_context_data(**kwargs)
        ctx.setdefault('page_title', self.get_page_title())
        ctx.setdefault('active_tab', self.active_nav)
        ctx.setdefault('active_tab', self.active_tab)
        return ctx
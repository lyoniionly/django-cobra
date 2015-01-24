from django.conf import settings
from django.http import HttpResponse
from django.template import loader, RequestContext, Context

from cobra.core.constants import EVENTS_PER_PAGE
from cobra.core.loading import get_model

Team = get_model('team', 'Team')

def get_default_context(request, existing_context=None, team=None):
    from cobra.plugins import plugins

    context = {
        'EVENTS_PER_PAGE': EVENTS_PER_PAGE,
        'URL_PREFIX': settings.COBRA_URL_PREFIX,
        'PLUGINS': plugins,
        'ALLOWED_HOSTS': settings.ALLOWED_HOSTS,
        'COBRA_RAVEN_JS_URL': settings.COBRA_RAVEN_JS_URL,
    }

    if request:
        if existing_context and not team and 'team' in existing_context:
            team = existing_context['team']

        if team:
            context['organization'] = team.organization

        context.update({
            'request': request,
        })

        if (not existing_context or 'TEAM_LIST' not in existing_context) and team:
            context['TEAM_LIST'] = Team.objects.get_for_user(
                organization=team.organization,
                user=request.user,
                with_projects=True,
            )

    return context


def render_to_string(template, context=None, request=None):

    # HACK: set team session value for dashboard redirect
    if context and 'team' in context and isinstance(context['team'], Team):
        team = context['team']
    else:
        team = None

    default_context = get_default_context(request, context, team=team)

    if context is None:
        context = default_context
    else:
        context = dict(context)
        context.update(default_context)

    if request:
        context = RequestContext(request, context)
    else:
        context = Context(context)

    return loader.render_to_string(template, context)


def render_to_response(template, context=None, request=None, status=200):
    response = HttpResponse(render_to_string(template, context, request))
    response.status_code = status

    return response
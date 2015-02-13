from __future__ import absolute_import, print_function

from functools import wraps
import logging
import warnings
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse

from django.db import OperationalError
from django.http import HttpResponseRedirect, HttpResponse
from sudo.decorators import sudo_required
from cobra.core.utils import get_login_url
from cobra.core.loading import get_model
from cobra.core.constants import MEMBER_OWNER

Organization = get_model('organization', 'Organization')
Team = get_model('team', 'Team')
Project = get_model('project', 'Project')


def deprecated(f):
    def _deprecated(*args, **kwargs):
        message = "Method '%s' is deprecated and will be " \
            "removed in the next major version of django-oscar" \
            % f.__name__
        warnings.warn(message, DeprecationWarning, stacklevel=2)
        return f(*args, **kwargs)
    return _deprecated


def ignore_db_signal_failure(func):
    @wraps(func)
    def wrapped(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except OperationalError:
            logging.exception('Failed processing signal %s', func.__name__)
            return
    return wrapped


def has_access(access_or_func=None, organization=None, access=None):
    """
    Tests and transforms project_id for permissions based on the requesting
    user. Passes the actual project instance to the decorated view.

    The default permission scope is 'user', which
    allows both 'user' and 'owner' access, but not 'system agent'.

    >>> @has_access(MEMBER_OWNER)
    >>> def foo(request, project):
    >>>     return

    >>> @has_access
    >>> def foo(request, project):
    >>>     return
    """
    # TODO(dcramer): this code is far too hacky these days and should
    # be replaced with class based views

    if callable(access_or_func):
        return has_access(None)(access_or_func)

    access = access_or_func

    def wrapped(func):
        warnings.warn(
            '%s.%s is used deprecated @has_access' % (func.__module__, func.__name__),
            DeprecationWarning)

        @wraps(func)
        def _wrapped(request, *args, **kwargs):
            # All requests require authentication
            if not request.user.is_authenticated():
                request.session['_next'] = request.get_full_path()
                if request.is_ajax():
                    return HttpResponse(status=401)
                return HttpResponseRedirect(get_login_url())

            has_org = 'organization_slug' in kwargs
            has_team = 'team_slug' in kwargs
            has_project = 'project_id' in kwargs

            organization_slug = kwargs.pop('organization_slug', None)
            team_slug = kwargs.pop('team_slug', None)
            project_id = kwargs.pop('project_id', None)

            assert not has_team or has_org, \
                'Must pass organization_slug with team_slug'

            if organization_slug:
                if not request.user.is_superuser:
                    if has_team or has_project:
                        org_access = None
                    else:
                        org_access = access
                    org_list = Organization.objects.get_for_user(
                        user=request.user,
                        access=org_access,
                    )

                    for o in org_list:
                        if o.slug == organization_slug:
                            organization = o
                            break
                    else:
                        logging.debug('User %s is not listed in organization with slug %s', request.user.id, organization_slug)
                        if request.is_ajax():
                            return HttpResponse(status=400)
                        return HttpResponseRedirect(reverse('home:home'))

                else:
                    try:
                        organization = Organization.objects.get_from_cache(
                            slug=organization_slug,
                        )
                    except Organization.DoesNotExist:
                        logging.debug('Organization with slug %s does not exist', organization_slug)
                        if request.is_ajax():
                            return HttpResponse(status=400)
                        return HttpResponseRedirect(reverse('home:home'))

            else:
                organization = None

            if team_slug:
                if not request.user.is_superuser:
                    team_list = Team.objects.get_for_user(
                        user=request.user,
                        access=access,
                        organization=organization,
                    )

                    for t in team_list:
                        if t.slug == team_slug:
                            team = t
                            break
                    else:
                        logging.debug('User %s is not listed in team with slug %s', request.user.id, team_slug)
                        if request.is_ajax():
                            return HttpResponse(status=400)
                        return HttpResponseRedirect(reverse('home:home'))

                else:
                    try:
                        team = Team.objects.get_from_cache(
                            slug=team_slug,
                            organization=organization,
                        )
                    except Team.DoesNotExist:
                        logging.debug('Team with slug %s does not exist', team_slug)
                        if request.is_ajax():
                            return HttpResponse(status=400)
                        return HttpResponseRedirect(reverse('home:home'))

            else:
                team = None

            if project_id:
                # Support project id's
                if project_id.isdigit():
                    lookup_kwargs = {'id': int(project_id)}
                elif organization:
                    lookup_kwargs = {'slug': project_id, 'organization': organization}
                else:
                    return HttpResponseRedirect(reverse('home:home'))

                try:
                    project = Project.objects.get_from_cache(**lookup_kwargs)
                except Project.DoesNotExist:
                    if project_id.isdigit():
                        # It could be a numerical slug
                        try:
                            project = Project.objects.get_from_cache(slug=project_id)
                        except Project.DoesNotExist:
                            if request.is_ajax():
                                return HttpResponse(status=400)
                            return HttpResponseRedirect(reverse('home:home'))
                    else:
                        if request.is_ajax():
                            return HttpResponse(status=400)
                        return HttpResponseRedirect(reverse('home:home'))

                if not request.user.is_superuser and not project.has_access(request.user, access=access):
                    if request.is_ajax():
                        return HttpResponse(status=400)
                    return HttpResponseRedirect(reverse('home:home'))
            else:
                project = None

            if has_project:
                kwargs['project'] = project

            if has_team:
                kwargs['team'] = team

            if has_org:
                kwargs['organization'] = organization

            return func(request, *args, **kwargs)

        if access == MEMBER_OWNER:
            _wrapped = login_required(sudo_required(_wrapped))
        return _wrapped
    return wrapped
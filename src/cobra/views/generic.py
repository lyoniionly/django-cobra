from __future__ import absolute_import

import json
import logging

from django import forms
from django.conf import settings
from django.core import validators
from django.template.context_processors import csrf
from django.core.exceptions import ValidationError
from django.core.urlresolvers import reverse
from django.shortcuts import redirect
from django.utils.decorators import method_decorator
from django.utils.encoding import smart_str
from django.contrib import messages
from django.http import HttpResponse, HttpResponseRedirect
from django.utils import six
from django.utils.six.moves import map
from django.utils.translation import ugettext_lazy as _
from django.views.decorators.csrf import csrf_protect
from django.views.generic.base import View

import phonenumbers
from sudo.views import redirect_to_sudo

from cobra.core.utils import safe_referrer, get_login_url
from cobra.core.phonenumber import PhoneNumber
from cobra.core.loading import get_classes, get_model
from cobra.core.render import render_to_response
from cobra.core.plugins import plugins
from cobra.core.plugins.base import Response
from cobra.core.auth import access

OrganizationMemberType, OrganizationStatus = get_classes('organization.utils',
                                                         [ 'OrganizationMemberType', 'OrganizationStatus'])

Organization = get_model('organization', 'Organization')
OrganizationMember = get_model('organization', 'OrganizationMember')

Project = get_model('project', 'Project')
Team = get_model('team', 'Team')



class PostActionMixin(object):
    """
    Simple mixin to forward POST request that contain a key 'action'
    onto a method of form "do_{action}".

    This only works with DetailView
    """
    def post(self, request, *args, **kwargs):
        if 'action' in self.request.POST:
            model = self.get_object()
            # The do_* method is required to do what it needs to with the model
            # it is passed, and then to assign the HTTP response to
            # self.response.
            method_name = "do_%s" % self.request.POST['action'].lower()
            if hasattr(self, method_name):
                getattr(self, method_name)(model)
                return self.response
            else:
                messages.error(request, _("Invalid form submission"))
        return super(PostActionMixin, self).post(request, *args, **kwargs)


class BulkEditMixin(object):
    """
    Mixin for views that have a bulk editing facility.  This is normally in the
    form of tabular data where each row has a checkbox.  The UI allows a number
    of rows to be selected and then some 'action' to be performed on them.
    """
    action_param = 'action'

    # Permitted methods that can be used to act on the selected objects
    actions = None
    checkbox_object_name = None

    def get_checkbox_object_name(self):
        if self.checkbox_object_name:
            return self.checkbox_object_name
        return smart_str(self.model._meta.object_name.lower())

    def get_error_url(self, request):
        return safe_referrer(request, '.')

    def get_success_url(self, request):
        return safe_referrer(request, '.')

    def post(self, request, *args, **kwargs):
        # Dynamic dispatch pattern - we forward POST requests onto a method
        # designated by the 'action' parameter.  The action has to be in a
        # whitelist to avoid security issues.
        action = request.POST.get(self.action_param, '').lower()
        if not self.actions or action not in self.actions:
            messages.error(self.request, _("Invalid action"))
            return redirect(self.get_error_url(request))

        ids = request.POST.getlist(
            'selected_%s' % self.get_checkbox_object_name())
        ids = list(map(int, ids))
        if not ids:
            messages.error(
                self.request,
                _("You need to select some %ss")
                % self.get_checkbox_object_name())
            return redirect(self.get_error_url(request))

        objects = self.get_objects(ids)
        return getattr(self, action)(request, objects)

    def get_objects(self, ids):
        object_dict = self.get_object_dict(ids)
        # Rearrange back into the original order
        return [object_dict[id] for id in ids]

    def get_object_dict(self, ids):
        return self.get_queryset().in_bulk(ids)


class ObjectLookupView(View):
    """Base view for json lookup for objects"""
    def get_queryset(self):
        return self.model.objects.all()

    def format_object(self, obj):
        return {
            'id': obj.pk,
            'text': six.text_type(obj),
        }

    def initial_filter(self, qs, value):
        return qs.filter(pk__in=value.split(','))

    def lookup_filter(self, qs, term):
        return qs

    def paginate(self, qs, page, page_limit):
        total = qs.count()

        start = (page - 1) * page_limit
        stop = start + page_limit

        qs = qs[start:stop]

        return qs, (page_limit * page < total)

    def get_args(self):
        GET = self.request.GET
        return (GET.get('initial', None),
                GET.get('q', None),
                int(GET.get('page', 1)),
                int(GET.get('page_limit', 20)))

    def get(self, request):
        self.request = request
        qs = self.get_queryset()

        initial, q, page, page_limit = self.get_args()

        if initial:
            qs = self.initial_filter(qs, initial)
            more = False
        else:
            if q:
                qs = self.lookup_filter(qs, q)
            qs, more = self.paginate(qs, page, page_limit)

        return HttpResponse(json.dumps({
            'results': [self.format_object(obj) for obj in qs],
            'more': more,
        }), content_type='application/json')


class PhoneNumberMixin(object):
    """
    Validation mixin for forms with a phone number, and optionally a country.
    It tries to validate the phone number, and on failure tries to validate it
    using a hint (the country provided), and treating it as a local number.
    """

    phone_number = forms.CharField(max_length=32, required=False)

    def get_country(self):
        # If the form data contains valid country information, we use that.
        if hasattr(self, 'cleaned_data') and 'country' in self.cleaned_data:
            return self.cleaned_data['country']
        # Oscar hides the field if there's only one country. Then (and only
        # then!) can we consider a country on the model instance.
        elif 'country' not in self.fields and hasattr(
                self.instance, 'country'):
            return self.instance.country

    def get_region_code(self, country):
        return country.iso_3166_1_a2

    def clean_phone_number(self):
        number = self.cleaned_data['phone_number']

        # empty
        if number in validators.EMPTY_VALUES:
            return None

        # Check for an international phone format
        try:
            phone_number = PhoneNumber.from_string(number)
        except phonenumbers.NumberParseException:
            # Try hinting with the shipping country
            country = self.get_country()
            region_code = self.get_region_code(country)

            if not region_code:
                # There is no shipping country, not a valid international
                # number
                raise ValidationError(
                    _(u'This is not a valid international phone format.'))

            # The PhoneNumber class does not allow specifying
            # the region. So we drop down to the underlying phonenumbers
            # library, which luckily allows parsing into a PhoneNumber
            # instance
            try:
                phone_number = PhoneNumber.from_string(
                    number, region=region_code)
                if not phone_number.is_valid():
                    raise ValidationError(
                        _(u'This is not a valid local phone format for %s.')
                        % country)
            except phonenumbers.NumberParseException:
                # Not a valid local or international phone number
                raise ValidationError(
                    _(u'This is not a valid local or international phone'
                      u' format.'))

        return phone_number


ERR_MISSING_SSO_LINK = _('You need to link your account with the SSO provider to continue.')

class OrganizationMixin(object):
    # TODO(dcramer): move the implicit organization logic into its own class
    # as it's only used in a single location and over complicates the rest of
    # the code
    def get_active_organization(self, request, organization_slug=None,
                                access=None):
        """
        Returns the currently active organization for the request or None
        if no organization.
        """
        UserOption = get_model('option', 'UserOption')
        options = UserOption.objects.get_all_values(user=request.user, project=None)
        active_organization = None

        is_implicit = organization_slug is None

        if is_implicit:
            organization_slug = request.session.get('activeorg') or options.get('last_active_org')

        if organization_slug is not None:
            if request.user.is_superuser:
                try:
                    active_organization = Organization.objects.get_from_cache(
                        slug=organization_slug,
                    )
                    if active_organization.status != OrganizationStatus.VISIBLE:
                        raise Organization.DoesNotExist
                except Organization.DoesNotExist:
                    logging.info('Active organization [%s] not found',
                                 organization_slug)
                    return None

        if active_organization is None:
            organizations = Organization.objects.get_for_user(
                user=request.user,
                access=access,
            )

        if active_organization is None and organization_slug:
            try:
                active_organization = (
                    o for o in organizations
                    if o.slug == organization_slug
                ).next()
            except StopIteration:
                logging.info('Active organization [%s] not found in scope',
                             organization_slug)
                if is_implicit:
                    del request.session['activeorg']
                    UserOption.objects.set_value(
                        user=request.user,
                        project=None,
                        key='last_active_org',
                        value=None,
                    )
                active_organization = None

        if active_organization is None:
            if not is_implicit:
                return None

            try:
                active_organization = organizations[0]
            except IndexError:
                logging.info('User is not a member of any organizations')
                pass

        if active_organization and active_organization.slug != request.session.get('activeorg'):
            request.session['activeorg'] = active_organization.slug

        if active_organization and active_organization.slug != options.get('last_active_org'):
            UserOption.objects.set_value(
                user=request.user,
                project=None,
                key='last_active_org',
                value=active_organization.slug,
            )

        return active_organization

    def get_active_team(self, request, organization, team_slug, access=None):
        """
        Returns the currently selected team for the request or None
        if no match.
        """
        try:
            team = Team.objects.get_from_cache(
                slug=team_slug,
                organization=organization,
            )
        except Team.DoesNotExist:
            return None

        if not request.user.is_superuser and not team.has_access(request.user, access):
            return None

        return team

    def get_active_project(self, request, organization, project_slug, access=None):
        try:
            project = Project.objects.get_from_cache(
                slug=project_slug,
                organization=organization,
            )
        except Project.DoesNotExist:
            return None

        if not request.user.is_superuser and not project.has_access(request.user, access):
            return None

        return project


class BaseView(View, OrganizationMixin):
    auth_required = True
    # TODO(dcramer): change sudo so it can be required only on POST
    sudo_required = False

    @method_decorator(csrf_protect)
    def dispatch(self, request, *args, **kwargs):
        if self.is_auth_required(request, *args, **kwargs):
            return self.handle_auth_required(request, *args, **kwargs)

        if self.is_sudo_required(request, *args, **kwargs):
            return self.handle_sudo_required(request, *args, **kwargs)

        args, kwargs = self.convert_args(request, *args, **kwargs)

        request.access = self.get_access(request, *args, **kwargs)

        if not self.has_permission(request, *args, **kwargs):
            return self.handle_permission_required(request, *args, **kwargs)

        self.request = request
        self.default_context = self.get_context_data(request, *args, **kwargs)

        return self.handle(request, *args, **kwargs)

    def get_access(self, request, *args, **kwargs):
        return access.DEFAULT

    def convert_args(self, request, *args, **kwargs):
        return (args, kwargs)

    def handle(self, request, *args, **kwargs):
        return super(BaseView, self).dispatch(request, *args, **kwargs)

    def is_auth_required(self, request, *args, **kwargs):
        return self.auth_required and not request.user.is_authenticated()

    def handle_auth_required(self, request, *args, **kwargs):
        request.session['_next'] = request.get_full_path()
        if 'organization_slug' in kwargs:
            # redirect_to = reverse('auth:organization',
            #                       args=[kwargs['organization_slug']])
            redirect_to = get_login_url()
        else:
            redirect_to = get_login_url()
        return self.redirect(redirect_to)

    def is_sudo_required(self, request, *args, **kwargs):
        return self.sudo_required and not request.is_sudo()

    def handle_sudo_required(self, request, *args, **kwargs):
        return redirect_to_sudo(request.get_full_path())

    def has_permission(self, request, *args, **kwargs):
        return True

    def handle_permission_required(self, request, *args, **kwargs):
        redirect_uri = self.get_no_permission_url(request, *args, **kwargs)
        return self.redirect(redirect_uri)

    def get_no_permission_url(request, *args, **kwargs):
        return reverse('home:home')

    def get_context_data(self, request, **kwargs):
        context = csrf(request)
        return context

    def respond(self, template, context=None, status=200):
        default_context = self.default_context
        if context:
            default_context.update(context)

        return render_to_response(template, default_context, self.request,
                                  status=status)

    def ajax_respond(self, context=None):
        default_context = self.default_context
        if context:
            default_context.update(context)
        response = HttpResponse(default_context)
        response['Content-Type'] = 'application/json'
        return response

    def redirect(self, url):
        return HttpResponseRedirect(url)

    def get_team_list(self, user, organization):
        return Team.objects.get_for_user(
            organization=organization,
            user=user,
            with_projects=True,
        )


class OrganizationView(BaseView):
    """
    Any view acting on behalf of an organization should inherit from this base.

    The 'organization' keyword argument is automatically injected into the
    resulting dispatch.
    """
    required_access = None
    valid_sso_required = True

    def get_access(self, request, organization, *args, **kwargs):
        return access.from_user(request.user, organization)

    def get_context_data(self, request, organization, **kwargs):
        context = super(OrganizationView, self).get_context_data(request)
        context['organization'] = organization
        context['TEAM_LIST'] = self.get_team_list(request.user, organization)
        context['ACCESS'] = {
            'team_read': request.access.has_scope('team:read'),
            'team_write': request.access.has_scope('team:write'),
            'team_delete': request.access.has_scope('team:delete'),
            'org_read': request.access.has_scope('org:read'),
            'org_write': request.access.has_scope('org:write'),
            'org_delete': request.access.has_scope('org:delete'),
            'project_read': request.access.has_scope('project:read'),
            'project_write': request.access.has_scope('project:write'),
            'project_delete': request.access.has_scope('project:delete'),
        }
        return context

    def has_permission(self, request, organization, *args, **kwargs):
        if organization is None:
            return False
        if self.valid_sso_required and not request.access.sso_is_valid:
            return False
        return True

    def handle_permission_required(self, request, organization, *args, **kwargs):
        needs_link = (
            organization and request.user.is_authenticated()
            and self.valid_sso_required and not request.access.sso_is_valid
        )

        if needs_link:
            messages.add_message(
                request, messages.ERROR,
                ERR_MISSING_SSO_LINK,
            )
            redirect_uri = reverse('cobra-auth-link-identity',
                                   args=[organization.slug])
        else:
            redirect_uri = self.get_no_permission_url(request, *args, **kwargs)
        return self.redirect(redirect_uri)

    def convert_args(self, request, organization_slug=None, *args, **kwargs):
        active_organization = self.get_active_organization(
            request=request,
            access=self.required_access,
            organization_slug=organization_slug,
        )

        kwargs['organization'] = active_organization

        return (args, kwargs)


class TeamView(OrganizationView):
    """
    Any view acting on behalf of a team should inherit from this base and the
    matching URL pattern must pass 'team_slug'.

    Two keyword arguments are added to the resulting dispatch:

    - organization
    - team
    """
    def get_context_data(self, request, organization, team, **kwargs):
        context = super(TeamView, self).get_context_data(request, organization)
        context['team'] = team
        return context

    def has_permission(self, request, organization, team, *args, **kwargs):
        rv = super(TeamView, self).has_permission(request, organization)
        if not rv:
            return rv
        return team is not None

    def convert_args(self, request, organization_slug, team_slug, *args, **kwargs):
        active_organization = self.get_active_organization(
            request=request,
            organization_slug=organization_slug,
        )

        if active_organization:
            active_team = self.get_active_team(
                request=request,
                team_slug=team_slug,
                organization=active_organization,
                access=self.required_access,
            )
        else:
            active_team = None

        kwargs['organization'] = active_organization
        kwargs['team'] = active_team

        return (args, kwargs)


class ProjectView(TeamView):
    """
    Any view acting on behalf of a project should inherit from this base and the
    matching URL pattern must pass 'team_slug' as well as 'project_slug'.

    Three keyword arguments are added to the resulting dispatch:

    - organization
    - team
    - project
    """
    def get_context_data(self, request, organization, team, project, **kwargs):
        context = super(ProjectView, self).get_context_data(request, organization, team)
        context['project'] = project
        return context

    def has_permission(self, request, organization, team, project, *args, **kwargs):
        rv = super(ProjectView, self).has_permission(request, organization, team)
        if not rv:
            return rv
        return project is not None

    def convert_args(self, request, organization_slug, project_slug, *args, **kwargs):
        active_organization = self.get_active_organization(
            request=request,
            organization_slug=organization_slug,
        )

        if active_organization:
            active_project = self.get_active_project(
                request=request,
                organization=active_organization,
                project_slug=project_slug,
                access=self.required_access,
            )
        else:
            active_project = None

        if active_project:
            active_team = active_project.team
        else:
            active_team = None

        kwargs['project'] = active_project
        kwargs['team'] = active_team
        kwargs['organization'] = active_organization

        return (args, kwargs)



def missing_perm(request, perm, **kwargs):
    """
    Returns a generic response if you're missing permission to perform an
    action.

    Plugins may overwrite this with the ``missing_perm_response`` hook.
    """
    response = plugins.first('missing_perm_response', request, perm, **kwargs)

    if response:
        if isinstance(response, HttpResponseRedirect):
            return response

        if not isinstance(response, Response):
            raise NotImplementedError('Use self.render() when returning responses.')

        return response.respond(request, {
            'perm': perm,
        })

    if perm.label:
        return render_to_response('error.html', {
            'title': _('Missing Permission'),
            'message': _('You do not have the required permissions to %s.') % (perm.label,)
        }, request)

    return HttpResponseRedirect(reverse('home:home'))
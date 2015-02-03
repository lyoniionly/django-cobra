from __future__ import absolute_import, print_function

import pytz
from datetime import datetime

from django import forms
from django.core.exceptions import ValidationError
from django.utils.datastructures import SortedDict
from django.utils.translation import ugettext_lazy as _

from cobra.core.loading import get_profile_class, get_model
from cobra.core.compat import get_user_model, existing_user_fields
from cobra.core.constants import LANGUAGES
from .utils import normalise_email


User = get_user_model()
Organization = get_model('organization', 'Organization')
UserOption = get_model('option', 'UserOption')


class SignupForm(forms.Form):
    first_name = forms.CharField(max_length=30, label=_('Name'))
    organization_name = forms.CharField(max_length=30, label=_('Organization name'),
                                        widget=forms.TextInput(attrs={'placeholder': _("Your Company's Name")}))

    def signup(self, request, user):
        user.first_name = self.cleaned_data['first_name']
        user.save()

        # Create a profile for new User
        Profile = get_profile_class()
        instance, create = Profile.objects.get_or_create(user=user)

        # Create a new organization for the new user.
        org = Organization.objects.create(
            name=self.cleaned_data['organization_name'],
            owner=user
        )
        return org

class UserForm(forms.ModelForm):

    def __init__(self, user, *args, **kwargs):
        self.user = user
        kwargs['instance'] = user
        super(UserForm, self).__init__(*args, **kwargs)
        if 'email' in self.fields:
            self.fields['email'].required = True

    def clean_email(self):
        """
        Make sure that the email address is aways unique as it is
        used instead of the username. This is necessary because the
        unique-ness of email addresses is *not* enforced on the model
        level in ``django.contrib.auth.models.User``.
        """
        email = normalise_email(self.cleaned_data['email'])
        if User._default_manager.filter(
                email__iexact=email).exclude(id=self.user.id).exists():
            raise ValidationError(
                _("A user with this email address already exists"))
        # Save the email unaltered
        return email

    class Meta:
        model = User
        fields = existing_user_fields(['first_name', 'last_name', 'email'])


Profile = get_profile_class()
if Profile:

    class UserAndProfileForm(forms.ModelForm):

        def __init__(self, user, *args, **kwargs):
            try:
                instance = Profile.objects.get(user=user)
            except Profile.DoesNotExist:
                # User has no profile, try a blank one
                instance = Profile(user=user)
            kwargs['instance'] = instance

            super(UserAndProfileForm, self).__init__(*args, **kwargs)

            # Get profile field names to help with ordering later
            profile_field_names = list(self.fields.keys())

            # Get user field names (we look for core user fields first)
            core_field_names = set([f.name for f in User._meta.fields])
            user_field_names = []
            # user_field_names = ['email']
            # for field_name in ('first_name', 'last_name'):
            for field_name in ('first_name',):
                if field_name in core_field_names:
                    user_field_names.append(field_name)
            # user_field_names.extend(User._meta.additional_fields)

            # Store user fields so we know what to save later
            self.user_field_names = user_field_names

            # Add additional user form fields
            additional_fields = forms.fields_for_model(
                User, fields=user_field_names)
            self.fields.update(additional_fields)

            # Ensure email is required and initialised correctly
            # self.fields['email'].required = True

            # hack for first name, rename "First Name" to "Name"
            self.fields['first_name'].label = _('Name')

            # Set initial values
            for field_name in user_field_names:
                self.fields[field_name].initial = getattr(user, field_name)

            # Ensure order of fields is email, user fields then profile fields
            self.fields.keyOrder = user_field_names + profile_field_names

            # If django.version >= 1.7
            self.fields = SortedDict([(key, self.fields[key]) for key in self.fields.keyOrder])

        class Meta:
            model = Profile
            exclude = ('user',)

        def clean_email(self):
            email = normalise_email(self.cleaned_data['email'])

            users_with_email = User._default_manager.filter(
                email__iexact=email).exclude(id=self.instance.user.id)
            if users_with_email.exists():
                raise ValidationError(
                    _("A user with this email address already exists"))
            return email

        def save(self, *args, **kwargs):
            user = self.instance.user

            # Save user also
            for field_name in self.user_field_names:
                setattr(user, field_name, self.cleaned_data[field_name])
            user.save()

            return super(ProfileForm, self).save(*args, **kwargs)

    ProfileForm = UserAndProfileForm
else:
    ProfileForm = UserForm


def _get_timezone_choices():
    results = []
    for tz in pytz.common_timezones:
        now = datetime.now(pytz.timezone(tz))
        offset = now.strftime('%z')
        results.append((int(offset), tz, '(GMT%s) %s' % (offset, tz)))
    results.sort()

    for i in range(len(results)):
        results[i] = results[i][1:]
    return results

TIMEZONE_CHOICES = _get_timezone_choices()

class AppearanceSettingsForm(forms.Form):
    language = forms.ChoiceField(
        label=_('Language'), choices=LANGUAGES, required=False,
        widget=forms.Select(attrs={'class': 'input-xlarge'}))
    timezone = forms.ChoiceField(
        label=_('Time zone'), choices=TIMEZONE_CHOICES, required=False,
        widget=forms.Select(attrs={'class': 'input-xxlarge'}))

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super(AppearanceSettingsForm, self).__init__(*args, **kwargs)

    def save(self):
        # Save user language
        UserOption.objects.set_value(
            user=self.user,
            project=None,
            key='language',
            value=self.cleaned_data['language'],
        )

        # Save time zone options
        UserOption.objects.set_value(
            user=self.user,
            project=None,
            key='timezone',
            value=self.cleaned_data['timezone'],
        )

        return self.user
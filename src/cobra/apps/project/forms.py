from __future__ import absolute_import

from django import forms
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext_lazy as _

from cobra.apps.svnkit.utils.check import check_repo_valid
from cobra.core.loading import get_model, get_class
from cobra.core.permissions import can_set_public_projects

AuditLogEntry = get_model('auditlog', 'AuditLogEntry')
Project = get_model('project', 'Project')
Repository = get_model('svnkit', 'Repository')
AuditLogEntryEvent = get_class('auditlog.utils', 'AuditLogEntryEvent')


BLANK_CHOICE = [("", "")]


class AddProjectForm(forms.ModelForm):
    name = forms.CharField(label=_('Name'), max_length=200,
        widget=forms.TextInput(attrs={
            'placeholder': _('Good project name will be nice'),
        }),
    )

    # platform = forms.ChoiceField(
    #     choices=Project._meta.get_field('platform').get_choices(blank_choice=BLANK_CHOICE),
    #     widget=forms.Select(attrs={
    #         'data-placeholder': _('Select a platform'),
    #     }),
    #     help_text='Your platform choice helps us setup some defaults for this project.',
    # )

    svn_url = forms.URLField(label=_('SVN URL'), max_length=512,
                             help_text=_('Example: svn://example.com or file:///svn/ or http://host:port'))
    svn_repo_prefix = forms.CharField(label=_('SVN Repository Prefix'), max_length=200, required=False,
                                      help_text=_('<strong class="text-danger">Important!</strong> You maybe meet this situation, the svn url you supply is not the '
                                                  'root of the repository, and you do not have the right permission '
                                                  'to access the real root of repository, input a right prefix of '
                                                  'repository, we will replace it for you automatic.<br><strong class="text-danger">If you do not have this problem, please ignore the attention.</strong>'))
    svn_username = forms.CharField(label=_('SVN Username'), max_length=512, required=False)
    svn_password = forms.CharField(label=_('SVN Password'), max_length=512, required=False,
                                   widget=forms.PasswordInput(render_value=True))

    class Meta:
        # fields = ('name', 'platform')
        fields = ('name', 'svn_url', 'svn_repo_prefix', 'svn_username', 'svn_password')
        model = Project
        widgets = {
            # 'svn_url': forms.URLInput(attrs={'placeholder': _(''),}),
            # 'svn_password': forms.PasswordInput()
        }

    def clean(self):
        cleaned_data = super(AddProjectForm, self).clean()
        svn_url = cleaned_data.get("svn_url")
        svn_username = cleaned_data.get("svn_username")
        svn_password = cleaned_data.get("svn_password")
        (is_repo_valid, msg) = check_repo_valid(svn_url, svn_username, svn_password)
        if not is_repo_valid:
            raise forms.ValidationError(msg)

    def save(self, actor, team, ip_address):
        project = super(AddProjectForm, self).save(commit=False)
        project.team = team
        project.organization = team.organization
        project.save()

        AuditLogEntry.objects.create(
            organization=project.organization,
            actor=actor,
            ip_address=ip_address,
            target_object=project.id,
            event=AuditLogEntryEvent.PROJECT_ADD,
            data=project.get_audit_log_data(),
        )

        # create repo for this project
        Repository.objects.create(project=project,
                                  root=self.cleaned_data['svn_url'],
                                  prefix=self.cleaned_data['svn_repo_prefix'],
                                  uri=self.cleaned_data['svn_url'],
                                  username=self.cleaned_data['svn_username'],
                                  password=self.cleaned_data['svn_password'])

        return project


class AddProjectWithTeamForm(AddProjectForm):
    team = forms.ChoiceField(choices=(), required=True)

    class Meta(AddProjectForm.Meta):
        # fields = ('name', 'team', 'platform')
        fields = ('name', 'team', 'svn_url', 'svn_username', 'svn_password')

    def __init__(self, user, team_list, *args, **kwargs):
        super(AddProjectWithTeamForm, self).__init__(*args, **kwargs)

        self.team_list = team_list

        self.fields['team'].choices = (
            (t.slug, t.name)
            for t in team_list
        )
        self.fields['team'].widget.choices = self.fields['team'].choices

    def clean_team(self):
        value = self.cleaned_data['team']
        for team in self.team_list:
            if value == team.slug:
                return team
        return None

    def save(self, actor, ip_address):
        team = self.cleaned_data['team']
        return super(AddProjectWithTeamForm, self).save(actor, team, ip_address)


class ProjectEditForm(forms.ModelForm):
    name = forms.CharField(label=_('Project Name'), max_length=200,
        widget=forms.TextInput(attrs={'placeholder': _('Project display name')}))
    # platform = forms.ChoiceField(choices=Project._meta.get_field('platform').get_choices(blank_choice=BLANK_CHOICE),
    #     widget=forms.Select(attrs={'data-placeholder': _('Select a platform')}))
    public = forms.BooleanField(required=False,
        help_text=_('Imply public access to this project.'))
    team = forms.TypedChoiceField(choices=(), coerce=int, required=False)
    svn_url = forms.URLField(label=_('SVN URL'), max_length=512,
                             help_text=_('Example: svn://example.com or file:///svn/ or http://host:port'))
    svn_repo_prefix = forms.CharField(label=_('SVN Repository Prefix'), max_length=200, required=False,
                                      help_text=_('<strong class="text-danger">Important!</strong> You maybe meet this situation, the svn url you supply is not the '
                                                  'root of the repository, and you do not have the right permission '
                                                  'to access the real root of repository, input a right prefix of '
                                                  'repository, we will replace it for you automatic.<br><strong class="text-danger">If you do not have this problem, please ignore the attention.</strong>'))
    svn_username = forms.CharField(label=_('SVN Username'), max_length=512, required=False)
    svn_password = forms.CharField(label=_('SVN Password'), max_length=512, required=False,
                                   widget=forms.PasswordInput(render_value=True))
    token = forms.CharField(label=_('Security token'), required=True,
        help_text=_('Outbound requests matching Allowed Domains will have the header "X-Cobra-Token: {token}" appended.'))

    class Meta:
        fields = ('name', 'public', 'team', 'slug')
        model = Project

    def __init__(self, request, organization, team_list, data, instance, *args, **kwargs):
        super(ProjectEditForm, self).__init__(data=data, instance=instance, *args, **kwargs)

        self.organization = organization
        self.team_list = team_list

        if not can_set_public_projects(request.user):
            del self.fields['public']
        self.fields['team'].choices = self.get_team_choices(team_list, instance.team)
        self.fields['team'].widget.choices = self.fields['team'].choices

    def get_team_label(self, team):
        return '%s (%s)' % (team.name, team.slug)

    def get_team_choices(self, team_list, default=None):
        sorted_team_list = sorted(team_list, key=lambda x: x.name)

        choices = []
        for team in sorted_team_list:
            # TODO: optimize queries
            choices.append(
                (team.id, self.get_team_label(team))
            )

        if default is None:
            choices.insert(0, (-1, mark_safe('&ndash;' * 8)))
        elif default not in sorted_team_list:
            choices.insert(0, (default.id, self.get_team_label(default)))

        return choices

    def clean_team(self):
        value = self.cleaned_data.get('team')
        if not value:
            return

        # TODO: why is this not already an int?
        value = int(value)
        if value == -1:
            return

        if self.instance.team and value == self.instance.team.id:
            return self.instance.team

        for team in self.team_list:
            if value == team.id:
                return team

        raise forms.ValidationError('Unable to find chosen team')

    def clean_slug(self):
        slug = self.cleaned_data.get('slug')
        if not slug:
            return
        exists_qs = Project.objects.filter(
            slug=slug,
            organization=self.organization
        ).exclude(id=self.instance.id)
        if exists_qs.exists():
            raise forms.ValidationError('Another project is already using that slug')
        return slug
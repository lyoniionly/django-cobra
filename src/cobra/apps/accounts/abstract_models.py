from __future__ import absolute_import, print_function

import warnings

from django.conf import settings
from django.contrib.auth import models as auth_models
from django.db import models
from django.utils import timezone
from django.utils.encoding import python_2_unicode_compatible

from django.utils.translation import ugettext_lazy as _
from easy_thumbnails.fields import ThumbnailerImageField

from cobra.core.loading import get_model
from cobra.core.compat import AUTH_USER_MODEL
from cobra.models import Model, BaseManager, fields
from cobra.core.utils import generate_sha1

from .utils import get_gravatar

class UserManager(BaseManager, auth_models.UserManager):
    pass

class AbstractUser(Model, auth_models.AbstractBaseUser):
    username = models.CharField(_('username'), max_length=128, unique=True)
    first_name = models.CharField(_('first name'), max_length=30, blank=True)
    last_name = models.CharField(_('last name'), max_length=30, blank=True)
    email = models.EmailField(_('email address'), blank=True)
    is_staff = models.BooleanField(
        _('staff status'), default=False,
        help_text=_('Designates whether the user can log into this admin '
                    'site.'))
    is_active = models.BooleanField(
        _('active'), default=True,
        help_text=_('Designates whether this user should be treated as '
                    'active. Unselect this instead of deleting accounts.'))
    is_superuser = models.BooleanField(
        _('superuser status'), default=False,
        help_text=_('Designates that this user has all permissions without '
                    'explicitly assigning them.'))
    is_managed = models.BooleanField(
        _('managed'), default=False,
        help_text=_('Designates whether this user should be treated as '
                    'managed. Select this to disallow the user from '
                    'modifying their account (username, password, etc).'))

    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)

    objects = UserManager(cache_fields=['pk'])

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        abstract = True
        db_table = 'auth_user'
        verbose_name = _('User')
        verbose_name_plural = _('Users')

    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email
        return super(AbstractUser, self).save(*args, **kwargs)

    def has_perm(self, perm_name):
        warnings.warn('User.has_perm is deprecated', DeprecationWarning)
        return self.is_superuser

    def has_module_perms(self, app_label):
        # the admin requires this method
        return self.is_superuser

    def get_full_name(self):
        return self.first_name

    def get_short_name(self):
        return self.username

    def merge_to(from_user, to_user):
        # TODO: we could discover relations automatically and make this useful
        GroupBookmark = None
        Organization = get_model('organization', 'Organization')
        OrganizationMember = get_model('organization', 'OrganizationMember')
        ProjectKey = get_model('project', 'ProjectKey')
        Team = get_model('team', 'Team')
        UserOption = get_model('accounts', 'UserOption')

        for obj in Organization.objects.filter(owner=from_user):
            obj.update(owner=to_user)
        for obj in ProjectKey.objects.filter(user=from_user):
            obj.update(user=to_user)
        for obj in OrganizationMember.objects.filter(user=from_user):
            obj.update(user=to_user)
        for obj in Team.objects.filter(owner=from_user):
            obj.update(owner=to_user)
        for obj in GroupBookmark.objects.filter(user=from_user):
            obj.update(user=to_user)
        for obj in UserOption.objects.filter(user=from_user):
            obj.update(user=to_user)

    def get_display_name(self):
        return self.first_name or self.username


def upload_to_avatar(instance, filename):
    extension = filename.split('.')[-1].lower()
    salt, hash = generate_sha1(instance.id)
    path = settings.COBRA_ACCOUNTS_AVATAR_PATH % {'username': instance.user.username,
                                                  'id': instance.user.id,
                                                  'date': instance.user.date_joined,
                                                  'date_now': timezone.now().date()}
    return '%(path)s%(hash)s.%(extension)s' % {'path': path,
                                               'hash': hash[:10],
                                               'extension': extension}


@python_2_unicode_compatible
class AbstractProfile(Model):
    """ Base model needed for profile functionality """

    AVATAR_SETTINGS = {'size': (settings.COBRA_ACCOUNTS_AVATAR_SIZE,
                                 settings.COBRA_ACCOUNTS_AVATAR_SIZE),
                       'crop': settings.COBRA_ACCOUNTS_AVATAR_CROP_TYPE}
    user = models.OneToOneField(AUTH_USER_MODEL, related_name="profile")
    avatar = ThumbnailerImageField(_('Avatar'),
                                    blank=True,
                                    upload_to=upload_to_avatar,
                                    resize_source=AVATAR_SETTINGS,
                                    help_text=_('A personal image displayed in your profile.'))
    objects = BaseManager(cache_fields=['pk'])


    class Meta:
        """
        Meta options making the model abstract and defining permissions.

        The model is ``abstract`` because it only supplies basic functionality
        to a more custom defined model that extends it. This way there is not
        another join needed.

        We also define custom permissions because we don't know how the model
        that extends this one is going to be called. So we don't know what
        permissions to check. For ex. if the user defines a profile model that
        is called ``MyProfile``, than the permissions would be
        ``add_myprofile`` etc. We want to be able to always check
        ``add_profile``, ``change_profile`` etc.

        """
        abstract = True

    def __str__(self):
        return 'Profile of %(username)s' % {'username': self.user.username}

    def get_avatar_url(self):
        """
        Returns the image containing the avatar for the user.

        The avatar can be a uploaded image or a Gravatar.

        Gravatar functionality will only be used when
        ``accounts_avatar_gravatar`` is set to ``True``.

        :return:
            ``None`` when Gravatar is not used and no default image is supplied
            by ``accounts_avatar_default``.

        """
        # First check for a avatar and if any return that.
        if self.avatar:
            return self.avatar.url

        # Use Gravatar if the user wants to.
        if settings.COBRA_ACCOUNTS_AVATAR_GRAVATAR:
            return get_gravatar(self.user.email,
                                settings.COBRA_ACCOUNTS_AVATAR_SIZE,
                                settings.COBRA_ACCOUNTS_AVATAR_DEFAULT)

        # Gravatar not used, check for a default image.
        else:
            if settings.COBRA_ACCOUNTS_AVATAR_DEFAULT not in ['404', 'mm',
                                                                'identicon',
                                                                'monsterid',
                                                                'wavatar']:
                return settings.COBRA_ACCOUNTS_AVATAR_DEFAULT
            else:
                return None
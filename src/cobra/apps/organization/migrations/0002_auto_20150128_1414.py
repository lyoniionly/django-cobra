# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.models.fields.foreignkey
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('team', '0001_initial'),
        ('organization', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='organizationmember',
            name='teams',
            field=models.ManyToManyField(to='team.Team', blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='organizationmember',
            name='user',
            field=cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='cobra_orgmember_set', blank=True, to=settings.AUTH_USER_MODEL, null=True),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='organizationmember',
            unique_together=set([('organization', 'user'), ('organization', 'email')]),
        ),
        migrations.AddField(
            model_name='organization',
            name='members',
            field=models.ManyToManyField(related_name='org_memberships', through='organization.OrganizationMember', to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='organization',
            name='owner',
            field=cobra.models.fields.foreignkey.FlexibleForeignKey(to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
    ]

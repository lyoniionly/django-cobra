# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.models.fields.bounded
import cobra.models.fields.foreignkey
import django.utils.timezone
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('organization', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PendingTeamMember',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('email', models.EmailField(max_length=75)),
                ('type', cobra.models.fields.bounded.BoundedIntegerField(default=50, choices=[(0, 'Owner'), (25, 'Admin'), (50, 'User'), (100, 'System Agent')])),
                ('date_added', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_pendingteammember',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Team',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('slug', models.SlugField()),
                ('name', models.CharField(max_length=64)),
                ('status', cobra.models.fields.bounded.BoundedPositiveIntegerField(default=0, choices=[(0, 'Active'), (1, 'Pending Deletion'), (2, 'Deletion in Progress')])),
                ('date_added', models.DateTimeField(default=django.utils.timezone.now, null=True)),
                ('organization', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='+', to='organization.Organization')),
                ('owner', cobra.models.fields.foreignkey.FlexibleForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_team',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='TeamMember',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('type', cobra.models.fields.bounded.BoundedIntegerField(default=50, choices=[(50, 'Member'), (0, 'Admin'), (100, 'Bot')])),
                ('date_added', models.DateTimeField(default=django.utils.timezone.now)),
                ('team', cobra.models.fields.foreignkey.FlexibleForeignKey(to='team.Team')),
                ('user', cobra.models.fields.foreignkey.FlexibleForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_teammember',
            },
            bases=(models.Model,),
        ),
        migrations.AlterUniqueTogether(
            name='teammember',
            unique_together=set([('team', 'user')]),
        ),
        migrations.AlterUniqueTogether(
            name='team',
            unique_together=set([('organization', 'slug')]),
        ),
        migrations.AddField(
            model_name='pendingteammember',
            name='team',
            field=cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='pending_member_set', to='team.Team'),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='pendingteammember',
            unique_together=set([('team', 'email')]),
        ),
    ]

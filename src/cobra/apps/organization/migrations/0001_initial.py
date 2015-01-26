# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone
import cobra.models.fields.foreignkey
import cobra.models.fields.bounded


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=64)),
                ('slug', models.SlugField(unique=True)),
                ('status', cobra.models.fields.bounded.BoundedPositiveIntegerField(default=0, choices=[(0, 'Visible'), (1, 'Pending Deletion'), (2, 'Deletion in Progress')])),
                ('date_added', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_organization',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='OrganizationMember',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('email', models.EmailField(max_length=75, null=True, blank=True)),
                ('type', cobra.models.fields.bounded.BoundedPositiveIntegerField(default=50, choices=[(100, 'Bot'), (50, 'Member'), (25, 'Admin'), (0, 'Owner')])),
                ('date_added', models.DateTimeField(default=django.utils.timezone.now)),
                ('has_global_access', models.BooleanField(default=True)),
                ('organization', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='member_set', to='organization.Organization')),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_organizationmember',
            },
            bases=(models.Model,),
        ),
    ]

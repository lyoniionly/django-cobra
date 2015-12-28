# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.models.fields.foreignkey
import cobra.models.fields.bounded
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0003_organization_avatar'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkReport',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('content', models.TextField(null=True, verbose_name='Content', blank=True)),
                ('summary', models.TextField(null=True, verbose_name='Summary', blank=True)),
                ('plan', models.TextField(null=True, verbose_name='Plan', blank=True)),
                ('type', models.CharField(max_length=10, verbose_name='Work Report Type')),
                ('year', models.IntegerField(verbose_name='Year')),
                ('serial_number', models.IntegerField(null=True, verbose_name='Serial Number', blank=True)),
                ('organization', cobra.models.fields.foreignkey.FlexibleForeignKey(to='organization.Organization')),
                ('owner', cobra.models.fields.foreignkey.FlexibleForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_summary',
            },
            bases=(models.Model,),
        ),
    ]

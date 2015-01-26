# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone
from django.conf import settings
import cobra.models.fields.gzippeddict
import cobra.models.fields.bounded


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AccessGroup',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('name', models.CharField(max_length=64)),
                ('type', cobra.models.fields.bounded.BoundedIntegerField(default=50, choices=[(0, 'Owner'), (25, 'Admin'), (50, 'User'), (100, 'System Agent')])),
                ('managed', models.BooleanField(default=False)),
                ('data', cobra.models.fields.gzippeddict.GzippedDictField(null=True, blank=True)),
                ('date_added', models.DateTimeField(default=django.utils.timezone.now)),
                ('members', models.ManyToManyField(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_accessgroup',
            },
            bases=(models.Model,),
        ),
    ]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.models.fields.bounded


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='svn_password',
            field=models.CharField(default='admin', max_length=128, verbose_name='password'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='project',
            name='svn_url',
            field=models.URLField(default='http://url.com/', verbose_name='url'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='project',
            name='svn_username',
            field=models.CharField(default='admin', max_length=30, verbose_name='username'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='projectkey',
            name='status',
            field=cobra.models.fields.bounded.BoundedPositiveIntegerField(default=0, db_index=True, choices=[(0, 'Active'), (1, 'Inactive')]),
            preserve_default=True,
        ),
    ]

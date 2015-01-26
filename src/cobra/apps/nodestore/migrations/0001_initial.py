# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone
import cobra.models.fields.gzippeddict


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Node',
            fields=[
                ('id', models.CharField(max_length=40, serialize=False, primary_key=True)),
                ('data', cobra.models.fields.gzippeddict.GzippedDictField()),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now, db_index=True)),
            ],
            options={
                'verbose_name': 'Node store',
                'verbose_name_plural': 'Node store',
            },
            bases=(models.Model,),
        ),
    ]

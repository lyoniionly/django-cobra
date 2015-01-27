# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone
import cobra.models.fields.bounded
import cobra.models.fields.pickle


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Option',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('key', models.CharField(unique=True, max_length=64)),
                ('value', cobra.models.fields.pickle.UnicodePickledObjectField(editable=False)),
                ('last_updated', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_option',
            },
            bases=(models.Model,),
        ),
    ]

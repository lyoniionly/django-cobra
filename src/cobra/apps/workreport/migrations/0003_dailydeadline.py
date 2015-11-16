# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.models.fields.foreignkey
import cobra.models.fields.bounded


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0005_project_desc'),
        ('workreport', '0002_auto_20151116_1121'),
    ]

    operations = [
        migrations.CreateModel(
            name='DailyDeadline',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('deadline_time', models.TimeField(verbose_name='Deadline Time')),
                ('project', cobra.models.fields.foreignkey.FlexibleForeignKey(to='project.Project')),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_workreport_daily_deadline',
            },
            bases=(models.Model,),
        ),
    ]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.models.fields.foreignkey
import cobra.models.fields.bounded


class Migration(migrations.Migration):

    dependencies = [
        ('workreport', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='DailyFinishedTask',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('desc', models.TextField(max_length=1000, verbose_name='Task Description')),
                ('hour', cobra.models.fields.bounded.BoundedIntegerField(default=1, choices=[(0, '0 hour'), (1, '1 hour'), (2, '2 hour'), (3, '3 hour'), (4, '4 hour'), (5, '5 hour'), (6, '6 hour'), (7, '7 hour'), (8, '8 hour'), (9, '9 hour'), (10, '10 hour'), (11, '11 hour'), (12, '12 hour')])),
                ('daily_report', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='daily_report_finished_tasks', to='workreport.DailyReport')),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_workreport_daily_finished_task',
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='dailyfinishedtasks',
            name='daily_report',
        ),
        migrations.DeleteModel(
            name='DailyFinishedTasks',
        ),
    ]

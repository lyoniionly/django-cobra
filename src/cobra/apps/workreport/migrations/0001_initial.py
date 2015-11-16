# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.models.fields.foreignkey
import django.utils.timezone
from django.conf import settings
import cobra.models.fields.bounded


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('project', '0005_project_desc'),
    ]

    operations = [
        migrations.CreateModel(
            name='DailyFinishedTasks',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('desc', models.TextField(max_length=1000, verbose_name='Task Description')),
                ('hour', cobra.models.fields.bounded.BoundedIntegerField(default=1, choices=[(0, '0 hour'), (1, '1 hour'), (2, '2 hour'), (3, '3 hour'), (4, '4 hour'), (5, '5 hour'), (6, '6 hour'), (7, '7 hour'), (8, '8 hour'), (9, '9 hour'), (10, '10 hour'), (11, '11 hour'), (12, '12 hour')])),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_workreport_daily_finished_tasks',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='DailyReport',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('desc', models.TextField(max_length=2048, null=True, verbose_name='Description', blank=True)),
                ('code_content', models.TextField(null=True, verbose_name='Code Content', blank=True)),
                ('which_date', models.DateField()),
                ('published_datetime', models.DateTimeField(default=django.utils.timezone.now, null=True)),
                ('owner', cobra.models.fields.foreignkey.FlexibleForeignKey(to=settings.AUTH_USER_MODEL)),
                ('project', cobra.models.fields.foreignkey.FlexibleForeignKey(to='project.Project')),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_workreport_daily',
            },
            bases=(models.Model,),
        ),
        migrations.AlterUniqueTogether(
            name='dailyreport',
            unique_together=set([('project', 'owner', 'which_date')]),
        ),
        migrations.AddField(
            model_name='dailyfinishedtasks',
            name='daily_report',
            field=cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='daily_report_finished_tasks', to='workreport.DailyReport'),
            preserve_default=True,
        ),
    ]

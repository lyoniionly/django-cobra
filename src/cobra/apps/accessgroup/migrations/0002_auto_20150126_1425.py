# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.models.fields.foreignkey


class Migration(migrations.Migration):

    dependencies = [
        ('accessgroup', '0001_initial'),
        ('team', '0001_initial'),
        ('project', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='accessgroup',
            name='projects',
            field=models.ManyToManyField(related_name='+', to='project.Project'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='accessgroup',
            name='team',
            field=cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='+', to='team.Team'),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='accessgroup',
            unique_together=set([('team', 'name')]),
        ),
    ]

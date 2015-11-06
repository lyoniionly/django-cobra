# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0004_project_avatar'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='desc',
            field=models.TextField(max_length=2048, null=True, verbose_name=b'Description', blank=True),
            preserve_default=True,
        ),
    ]

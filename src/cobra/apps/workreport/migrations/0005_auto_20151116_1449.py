# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('workreport', '0004_auto_20151116_1354'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='dailydeadline',
            name='hour',
        ),
        migrations.RemoveField(
            model_name='dailydeadline',
            name='minute',
        ),
        migrations.AddField(
            model_name='dailydeadline',
            name='deadline_time',
            field=models.TimeField(default='19:00'),
            preserve_default=False,
        ),
    ]

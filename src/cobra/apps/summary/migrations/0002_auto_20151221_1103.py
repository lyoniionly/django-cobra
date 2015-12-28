# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('summary', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='workreport',
            name='created_datetime',
            field=models.DateTimeField(default=datetime.datetime(2015, 12, 21, 3, 3, 18, 470000, tzinfo=utc), verbose_name='Created at', auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='workreport',
            name='updated_datetime',
            field=models.DateTimeField(default=datetime.datetime(2015, 12, 21, 3, 3, 27, 741000, tzinfo=utc), verbose_name='Last Modified', auto_now=True),
            preserve_default=False,
        ),
    ]

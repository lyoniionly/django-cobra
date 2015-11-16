# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.models.fields.bounded


class Migration(migrations.Migration):

    dependencies = [
        ('workreport', '0003_dailydeadline'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='dailydeadline',
            name='deadline_time',
        ),
        migrations.AddField(
            model_name='dailydeadline',
            name='hour',
            field=cobra.models.fields.bounded.BoundedIntegerField(default=19, choices=[(0, b'00'), (1, b'01'), (2, b'02'), (3, b'03'), (4, b'04'), (5, b'05'), (6, b'06'), (7, b'07'), (8, b'08'), (9, b'09'), (10, b'10'), (11, b'11'), (12, b'12'), (13, b'13'), (14, b'14'), (15, b'15'), (16, b'16'), (17, b'17'), (18, b'18'), (19, b'19'), (20, b'20'), (21, b'21'), (22, b'22'), (23, b'23')]),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='dailydeadline',
            name='minute',
            field=cobra.models.fields.bounded.BoundedIntegerField(default=0, choices=[(0, b'00'), (30, b'30')]),
            preserve_default=True,
        ),
    ]

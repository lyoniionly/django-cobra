# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auditlog', '0002_auto_20150305_1618'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='auditlogentry',
            name='target_content_type',
        ),
        migrations.RemoveField(
            model_name='auditlogentry',
            name='target_object_id',
        ),
    ]

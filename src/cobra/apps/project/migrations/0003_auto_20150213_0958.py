# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0002_auto_20150210_1315'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='project',
            name='svn_password',
        ),
        migrations.RemoveField(
            model_name='project',
            name='svn_url',
        ),
        migrations.RemoveField(
            model_name='project',
            name='svn_username',
        ),
    ]

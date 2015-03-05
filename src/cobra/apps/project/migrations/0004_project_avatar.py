# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.apps.project.abstract_models
import easy_thumbnails.fields


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0003_auto_20150213_0958'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='avatar',
            field=easy_thumbnails.fields.ThumbnailerImageField(help_text='The maximum file size allowed is 200KB.', upload_to=cobra.apps.project.abstract_models.upload_to_avatar, verbose_name='Project Avatar', blank=True),
            preserve_default=True,
        ),
    ]

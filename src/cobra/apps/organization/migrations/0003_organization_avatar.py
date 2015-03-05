# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.apps.organization.abstract_models
import easy_thumbnails.fields


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0002_auto_20150128_1414'),
    ]

    operations = [
        migrations.AddField(
            model_name='organization',
            name='avatar',
            field=easy_thumbnails.fields.ThumbnailerImageField(help_text='The maximum file size allowed is 200KB.', upload_to=cobra.apps.organization.abstract_models.upload_to_avatar, verbose_name='Organization Avatar', blank=True),
            preserve_default=True,
        ),
    ]

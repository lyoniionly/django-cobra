# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.models.fields.bounded


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0001_initial'),
        ('auditlog', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='auditlogentry',
            name='target_content_type',
            field=models.ForeignKey(related_name='target', blank=True, to='contenttypes.ContentType', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='auditlogentry',
            name='target_object_id',
            field=models.CharField(db_index=True, max_length=255, null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='auditlogentry',
            name='event',
            field=cobra.models.fields.bounded.BoundedPositiveIntegerField(choices=[(1, b'member.invite'), (2, b'member.add'), (3, b'member.accept-invite'), (5, b'member.remove'), (4, b'member.edit'), (20, b'team.create'), (21, b'team.edit'), (22, b'team.remove'), (30, b'project.create'), (31, b'project.edit'), (32, b'project.remove'), (33, b'project.set-public'), (34, b'project.set-private'), (10, b'org.create'), (11, b'org.edit'), (40, b'tagkey.remove'), (50, b'projectkey.create'), (51, b'projectkey.edit'), (52, b'projectkey.remove'), (53, b'projectkey.enable'), (53, b'projectkey.disable')]),
            preserve_default=True,
        ),
    ]

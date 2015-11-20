# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.models.fields.foreignkey


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0003_organization_avatar'),
        ('workreport', '0005_auto_20151116_1449'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='dailydeadline',
            name='project',
        ),
        migrations.AddField(
            model_name='dailydeadline',
            name='organization',
            field=cobra.models.fields.foreignkey.FlexibleForeignKey(default=1, to='organization.Organization'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='dailyreport',
            name='organization',
            field=cobra.models.fields.foreignkey.FlexibleForeignKey(default=1, to='organization.Organization'),
            preserve_default=False,
        ),
        migrations.AlterUniqueTogether(
            name='dailyreport',
            unique_together=set([('organization', 'owner', 'which_date')]),
        ),
        migrations.RemoveField(
            model_name='dailyreport',
            name='project',
        ),
    ]

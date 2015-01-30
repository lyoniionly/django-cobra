# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.models.fields.gzippeddict
import cobra.models.fields.foreignkey
import django.utils.timezone
from django.conf import settings
import cobra.models.fields.bounded


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0002_auto_20150128_1414'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AuditLogEntry',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('target_object', cobra.models.fields.bounded.BoundedPositiveIntegerField(null=True)),
                ('event', cobra.models.fields.bounded.BoundedPositiveIntegerField(choices=[(1, b'member.invite'), (2, b'member.add'), (3, b'member.accept-invite'), (5, b'member.remove'), (4, b'member.edit'), (20, b'team.create'), (21, b'team.edit'), (22, b'team.remove'), (30, b'project.create'), (31, b'project.edit'), (32, b'project.remove'), (33, b'project.set-public'), (34, b'project.set-private'), (10, b'org.create'), (11, b'org.edit')])),
                ('ip_address', models.GenericIPAddressField(null=True, unpack_ipv4=True)),
                ('data', cobra.models.fields.gzippeddict.GzippedDictField()),
                ('datetime', models.DateTimeField(default=django.utils.timezone.now)),
                ('actor', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='audit_actors', to=settings.AUTH_USER_MODEL)),
                ('organization', cobra.models.fields.foreignkey.FlexibleForeignKey(to='organization.Organization')),
                ('target_user', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='audit_targets', blank=True, to=settings.AUTH_USER_MODEL, null=True)),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_auditlogentry',
            },
            bases=(models.Model,),
        ),
    ]

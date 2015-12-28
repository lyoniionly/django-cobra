# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.models.fields.foreignkey
import cobra.models.fields.bounded
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('contenttypes', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserShare',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('object_id', models.IntegerField()),
                ('share_type', models.CharField(max_length=100, null=True, verbose_name='Share Type', blank=True)),
                ('entry_type', models.CharField(max_length=100, null=True, verbose_name='Entry Type', blank=True)),
                ('module', models.CharField(max_length=100, null=True, verbose_name='Module', blank=True)),
                ('content_type', models.ForeignKey(to='contenttypes.ContentType')),
                ('user', cobra.models.fields.foreignkey.FlexibleForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_user_share',
            },
            bases=(models.Model,),
        ),
    ]

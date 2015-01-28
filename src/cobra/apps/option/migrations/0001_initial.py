# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import cobra.models.fields.bounded
import cobra.models.fields.pickle
from django.conf import settings
import django.utils.timezone
import cobra.models.fields.foreignkey


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('project', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Option',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('key', models.CharField(unique=True, max_length=64)),
                ('value', cobra.models.fields.pickle.UnicodePickledObjectField(editable=False)),
                ('last_updated', models.DateTimeField(default=django.utils.timezone.now)),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_option',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ProjectOption',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('key', models.CharField(max_length=64)),
                ('value', cobra.models.fields.pickle.UnicodePickledObjectField(editable=False)),
                ('project', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='+', to='project.Project')),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_projectoptions',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='UserOption',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('key', models.CharField(max_length=64)),
                ('value', cobra.models.fields.pickle.UnicodePickledObjectField(editable=False)),
                ('project', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='+', to='project.Project', null=True)),
                ('user', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_useroption',
                'verbose_name': 'User Option',
                'verbose_name_plural': 'User Options',
            },
            bases=(models.Model,),
        ),
        migrations.AlterUniqueTogether(
            name='useroption',
            unique_together=set([('user', 'project', 'key')]),
        ),
        migrations.AlterUniqueTogether(
            name='projectoption',
            unique_together=set([('project', 'key')]),
        ),
    ]

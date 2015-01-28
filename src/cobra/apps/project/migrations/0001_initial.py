# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import bitfield.models
import cobra.models.fields.bounded
from django.conf import settings
import django.utils.timezone
import cobra.models.fields.foreignkey


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('team', '0001_initial'),
        ('organization', '0002_auto_20150128_1414'),
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('slug', models.SlugField(null=True)),
                ('name', models.CharField(max_length=200)),
                ('public', models.BooleanField(default=False)),
                ('date_added', models.DateTimeField(default=django.utils.timezone.now)),
                ('status', cobra.models.fields.bounded.BoundedPositiveIntegerField(default=0, db_index=True, choices=[(0, 'Active'), (1, 'Pending Deletion'), (2, 'Deletion in Progress')])),
                ('platform', models.CharField(max_length=32, null=True, choices=[(b'csharp', b'C#'), (b'connect', b'Connect (Node.js)'), (b'django', b'Django (Python)'), (b'express', b'Express (Node.js)'), (b'flask', b'Flask (Python)'), (b'go', b'Go'), (b'ios', b'iOS'), (b'java', b'Java'), (b'java_log4j', b'Log4j (Java)'), (b'java_log4j2', b'Log4j 2.x (Java)'), (b'java_logback', b'Logback (Java)'), (b'java_logging', b'java.util.logging'), (b'javascript', b'Javascript'), (b'node.js', b'Node.Js'), (b'php', b'PHP'), (b'pyramid', b'Pyramid (Python)'), (b'python', b'Python'), (b'r', b'R'), (b'ruby', b'Ruby'), (b'rails3', b'Rails 3 (Ruby)'), (b'rails4', b'Rails 4 (Ruby)'), (b'sidekiq', b'Sidekiq'), (b'sinatra', b'Sinatra'), (b'tornado', b'Tornado'), (b'other', b'Other')])),
                ('organization', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='+', to='organization.Organization')),
                ('team', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='+', to='team.Team')),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_project',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ProjectKey',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('label', models.CharField(max_length=64, null=True, blank=True)),
                ('public_key', models.CharField(max_length=32, unique=True, null=True)),
                ('secret_key', models.CharField(max_length=32, unique=True, null=True)),
                ('roles', bitfield.models.BitField(((b'store', b'Event API access'), (b'api', b'Web API access')), default=1)),
                ('date_added', models.DateTimeField(default=django.utils.timezone.now, null=True)),
                ('project', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='key_set', to='project.Project')),
                ('user', cobra.models.fields.foreignkey.FlexibleForeignKey(to=settings.AUTH_USER_MODEL, null=True)),
                ('user_added', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='keys_added_set', to=settings.AUTH_USER_MODEL, null=True)),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_projectkey',
            },
            bases=(models.Model,),
        ),
        migrations.AlterUniqueTogether(
            name='project',
            unique_together=set([('organization', 'slug'), ('team', 'slug')]),
        ),
    ]

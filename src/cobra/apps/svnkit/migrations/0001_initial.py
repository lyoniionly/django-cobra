# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc
import django.utils.timezone
import cobra.models.fields.foreignkey
import cobra.models.fields.bounded


class Migration(migrations.Migration):

    dependencies = [
        ('project', '0003_auto_20150213_0958'),
    ]

    operations = [
        migrations.CreateModel(
            name='Change',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('path', models.CharField(max_length=2048, db_index=True)),
                ('action', models.CharField(max_length=1)),
                ('copied_from_path', models.CharField(max_length=2048, null=True)),
                ('copied_from_revision', models.PositiveIntegerField(null=True)),
            ],
            options={
                'ordering': ('changeset', 'path'),
                'abstract': False,
                'db_table': 'cobra_svn_change',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Changeset',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('date', models.DateTimeField()),
                ('revision', models.PositiveIntegerField(db_index=True)),
                ('author', models.CharField(max_length=512)),
                ('message', models.TextField()),
            ],
            options={
                'ordering': ('-revision',),
                'abstract': False,
                'db_table': 'cobra_svn_changeset',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Content',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('path', models.CharField(max_length=2048)),
                ('last_changed', models.DateTimeField()),
                ('cached', models.DateTimeField(default=django.utils.timezone.now)),
                ('size', models.PositiveIntegerField(default=0)),
                ('data', models.TextField()),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_svn_content',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Node',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('path', models.CharField(max_length=2048, db_index=True)),
                ('node_type', models.CharField(max_length=1)),
                ('size', models.PositiveIntegerField(default=0)),
                ('last_changed', models.DateTimeField(null=True)),
                ('revision', models.PositiveIntegerField()),
                ('cached', models.DateTimeField(default=django.utils.timezone.now)),
                ('cached_indirectly', models.BooleanField(default=True)),
                ('content', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='nodes', to='svnkit.Content', null=True)),
                ('parent', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='children', to='svnkit.Node', null=True)),
            ],
            options={
                'ordering': ('node_type', 'path'),
                'abstract': False,
                'db_table': 'cobra_svn_node',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Property',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('key', models.CharField(max_length=512, db_index=True)),
                ('value', models.TextField()),
                ('node', cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='properties', to='svnkit.Node')),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_svn_property',
                'verbose_name_plural': 'properties',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Repository',
            fields=[
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('uuid', models.CharField(max_length=128, editable=False)),
                ('root', models.CharField(help_text='Example: svn://example.com or file:///svn/ or http://host:port', max_length=512)),
                ('prefix', models.CharField(help_text='<strong class="text-danger">Important!</strong> You maybe meet this situation, the svn url you supply is not the root of the repository, and you do not have the right permission to access the real root of repository, input a right prefix of repository, we will replace it for you automatic.<br><strong class="text-danger">If you do not have this problem, please ignore the attention.</strong>', max_length=512, blank=True)),
                ('uri', models.CharField(help_text='Externally facing URI for the repository, if available', max_length=512, blank=True)),
                ('is_private', models.BooleanField(default=False)),
                ('username', models.CharField(max_length=512, blank=True)),
                ('password', models.CharField(max_length=512, blank=True)),
                ('last_synced', models.DateTimeField(default=datetime.datetime(1970, 1, 1, 0, 0, tzinfo=utc), editable=False)),
                ('project', models.OneToOneField(to='project.Project')),
            ],
            options={
                'abstract': False,
                'db_table': 'cobra_svn_repository',
                'verbose_name_plural': 'repositories',
            },
            bases=(models.Model,),
        ),
        migrations.AlterUniqueTogether(
            name='property',
            unique_together=set([('node', 'key')]),
        ),
        migrations.AddField(
            model_name='node',
            name='repository',
            field=cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='nodes', to='svnkit.Repository'),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='node',
            unique_together=set([('repository', 'path', 'revision')]),
        ),
        migrations.AddField(
            model_name='content',
            name='repository',
            field=cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='content', to='svnkit.Repository'),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='content',
            unique_together=set([('repository', 'path', 'last_changed')]),
        ),
        migrations.AddField(
            model_name='changeset',
            name='repository',
            field=cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='changesets', to='svnkit.Repository'),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='changeset',
            unique_together=set([('repository', 'revision')]),
        ),
        migrations.AddField(
            model_name='change',
            name='changeset',
            field=cobra.models.fields.foreignkey.FlexibleForeignKey(related_name='changes', to='svnkit.Changeset'),
            preserve_default=True,
        ),
        migrations.AlterUniqueTogether(
            name='change',
            unique_together=set([('changeset', 'path')]),
        ),
    ]

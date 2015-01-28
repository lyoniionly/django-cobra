# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone
import cobra.models.fields.bounded


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(default=django.utils.timezone.now, verbose_name='last login')),
                ('id', cobra.models.fields.bounded.BoundedBigAutoField(serialize=False, primary_key=True)),
                ('username', models.CharField(unique=True, max_length=128, verbose_name='username')),
                ('first_name', models.CharField(max_length=30, verbose_name='first name', blank=True)),
                ('last_name', models.CharField(max_length=30, verbose_name='last name', blank=True)),
                ('email', models.EmailField(max_length=75, verbose_name='email address', blank=True)),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('is_managed', models.BooleanField(default=False, help_text='Designates whether this user should be treated as managed. Select this to disallow the user from modifying their account (username, password, etc).', verbose_name='managed')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
            ],
            options={
                'abstract': False,
                'db_table': 'auth_user',
                'verbose_name': 'User',
                'swappable': 'AUTH_USER_MODEL',
                'verbose_name_plural': 'Users',
            },
            bases=(models.Model,),
        ),
    ]

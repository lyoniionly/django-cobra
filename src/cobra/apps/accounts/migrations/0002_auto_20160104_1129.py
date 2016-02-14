# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-01-04 03:29
from __future__ import unicode_literals

import cobra.apps.accounts.abstract_models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelManagers(
            name='user',
            managers=[
                ('objects', cobra.apps.accounts.abstract_models.UserManager(cache_fields=[b'pk'])),
            ],
        ),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(blank=True, max_length=254, verbose_name='email address'),
        ),
        migrations.AlterField(
            model_name='user',
            name='last_login',
            field=models.DateTimeField(blank=True, null=True, verbose_name='last login'),
        ),
    ]
#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import absolute_import

from datetime import datetime
from django.utils import timezone


def epoch(dateobj, msec=False):
    try:
        epoch = int(dateobj.strftime('%s'))
    except:
        epoch = int((dateobj - dateobj.utcoffset() - datetime(1970,1,1, tzinfo=timezone.utc)).total_seconds())
    if msec:
        epoch *= 1000
    return epoch

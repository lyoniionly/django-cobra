from __future__ import absolute_import

from django import template

from cobra.core.javascript import to_json

register = template.Library()

register.filter(to_json)
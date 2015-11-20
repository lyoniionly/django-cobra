# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function
from collections import OrderedDict

from django import template
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.utils.translation import ugettext_lazy as _

from cobra.core.loading import get_model


register = template.Library()

DailyDeadline = get_model('workreport', 'DailyDeadline')
DailyReport = get_model('workreport', 'DailyReport')

@register.inclusion_tag('partials/workreport/_report_date_nav.html', takes_context=True)
def report_date_nav(context, is_team, user=None, *args, **kwargs):
    request_user = context['request'].user
    organization = context['organization']
    filter_date = context['filter_date']
    selected_years = context['selected_years']
    months = OrderedDict((
            ('Jan', _('January')), ('Feb', _('February')), ('Mar', _('March')), ('Apr', _('April')), ('May', _('May')), ('Jun', _('June')),
            ('Jul', _('July')), ('Aug', _('August')), ('Sep', _('September')), ('Oct', _('October')), ('Nov', _('November')),
            ('Dec', _('December'))
        ))

    # do nothing when user isn't authenticated
    if not request_user.is_authenticated():
        return ''

    if not is_team and user is None:
        return ''

    ctx = {
        'is_team': is_team,
        'report_user': user,
        'organization': organization,
        'filter_date': filter_date,
        'months': months,
        'selected_years': selected_years
    }
    # ctx.update(context)
    ctx.update(kwargs)
    return ctx


@register.assignment_tag
def get_deadline_time(organization):
    try:
        dd = DailyDeadline.objects.get(organization=organization)
        deadline = str(dd.deadline_time)
    except Exception as e:
        deadline = settings.COBRA_WORKREPORT_DAILY_DEADLINE
    return deadline
    
    
@register.assignment_tag
def get_daily_report(organization, user, which_date):
    try:
        daily_report = DailyReport.objects.get(organization=organization, owner=user, which_date=which_date)
    except ObjectDoesNotExist as e:
        daily_report = None
    except MultipleObjectsReturned as e:
        daily_report = DailyReport.objects.filter(organization=organization, owner=user, which_date=which_date)[0]
    except Exception as e:
        daily_report = None
    return daily_report
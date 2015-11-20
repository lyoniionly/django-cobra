from __future__ import absolute_import
import calendar
from collections import OrderedDict
import collections
from itertools import groupby
import json
from braces.views import JSONResponseMixin
import datetime
from django import http
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.core.urlresolvers import reverse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dates import MONTHS
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.generic import View
from cobra.apps.workreport.constants import WORKREPORT_STATUS_INCOMPLETE, WORKREPORT_STATUS_DEFAULT, \
    WORKREPORT_STATUS_TEAM_COMPLETE, WORKREPORT_STATUS_TEAM_PARTCOMPLETE, WORKREPORT_STATUS_TEAM_INCOMPLETE
from cobra.core.loading import get_model, get_class
from django.utils.translation import ugettext_lazy as _
from django.views import generic
from cobra.views.generic import ProjectView, OrganizationView
from cobra.views.mixins import DailyMixin
from cobra.core.utils import date_from_string, get_datetime_now, get_local_datetime_now
from cobra.core.calendar import get_calendar_first_weekday
from cobra.core.compat import get_user_model

User = get_user_model()

OrganizationMember = get_model('organization', 'organizationMember')
DailyReport = get_model('workreport', 'DailyReport')
DailyFinishedTask = get_model('workreport', 'DailyFinishedTask')


class DailyReportView(DailyMixin, OrganizationView):
    def get(self, request, organization, *args, **kwargs):
        report_user = get_object_or_404(User, username__iexact=self.kwargs['username'])

        year = self.get_year()
        month = self.get_month()
        day = self.get_day()
        filter_date = date_from_string(year, self.get_year_format(),
                                 month, self.get_month_format(),
                                 day, self.get_day_format())

        try:
            daily_report = DailyReport.objects.get(organization=organization, owner=report_user, which_date=filter_date)
        except ObjectDoesNotExist as e:
            daily_report = None
        except MultipleObjectsReturned as e:
            daily_report = DailyReport.objects.filter(organization=organization, owner=report_user, which_date=filter_date)[0]
        except Exception as e:
            daily_report = None

        if request.user==report_user:
            active_tab = 'mine'
        else:
            active_tab = 'member'

        context = {
            'active_nav': 'daily_report',
            'active_tab': active_tab,
            'selected_years': self._get_selected_years(),
            'filter_date': filter_date,
            'report_user': report_user,
            'daily_report': daily_report,
            'can_switch_view_model': True,
            'is_calendar': True,
            'view_model_url': reverse('organization:workreport:daily-member-report-list', args=[organization.slug, request.user.username])
        }
        template_name = 'organization/workreport/daily/calendar_report.html'
        return self.respond(template_name, context)

    def _get_selected_years(self):
        now = get_local_datetime_now()
        years = []
        for i in [0, 1, 2, 3]:
            years.append(now.year - i)
        return years


class DailyReportListView(OrganizationView):
    def get(self, request, organization, *args, **kwargs):
        report_user = get_object_or_404(User, username__iexact=self.kwargs['username'])

        daily_reports = DailyReport.objects.filter(organization=organization, owner=report_user).order_by('-which_date')
        active_tab = 'member'

        context = {
            'active_nav': 'daily_report',
            'active_tab': active_tab,
            'report_user': report_user,
            'daily_reports': daily_reports,
            'can_switch_view_model': True,
            'is_calendar': False,
            'view_model_url': 'ssss'#reverse('organization:workreport:daily-member-day', args=[organization.slug, request.user.username, year, month, day])
        }
        template_name = 'organization/workreport/daily/list_report.html'
        return self.respond(template_name, context)


class DailyReportEditView(JSONResponseMixin, DailyMixin, OrganizationView):
    def get(self, request, organization, *args, **kwargs):
        year = self.get_year()
        month = self.get_month()
        day = self.get_day()
        report_date = date_from_string(year, self.get_year_format(),
                                 month, self.get_month_format(),
                                 day, self.get_day_format())
        try:
            daily_report = DailyReport.objects.get(organization=organization, owner=request.user, which_date=report_date)
        except ObjectDoesNotExist as e:
            daily_report = None
        except MultipleObjectsReturned as e:
            daily_report = DailyReport.objects.filter(organization=organization, owner=request.user, which_date=report_date)[0]
        except Exception as e:
            daily_report = None
        context = {
            'organization': organization,
            'report_date': report_date,
            'daily_report': daily_report
        }
        template_name = 'organization/workreport/daily/edit_report.html'
        return self.respond(template_name, context)

    def post(self, request, organization, *args, **kwargs):
        year = self.get_year()
        month = self.get_month()
        day = self.get_day()
        report_date = date_from_string(year, self.get_year_format(),
                                 month, self.get_month_format(),
                                 day, self.get_day_format())
        tasks = request.POST.getlist('tasks[]')
        report_desc = request.POST.get('report_desc')
        code_content = request.POST.get('code_content')
        obj, created = DailyReport.objects.update_or_create(organization=organization, owner=request.user, which_date=report_date, defaults={
            'desc': report_desc,
            'code_content': code_content
        })

        obj.daily_report_finished_tasks.all().delete()
        for task in tasks:
            t = json.loads(task)
            DailyFinishedTask.objects.create(daily_report=obj, desc=t.get('content'), hour=int(t.get('hour')))

        context = {
            'redirect_url': reverse('organization:workreport:daily-member-day', args=[organization.slug, request.user.username, year, month, day])
        }
        return self.render_json_response(context)


class DailyTeamReportView(DailyMixin, OrganizationView):
    def get(self, request, organization, *args, **kwargs):
        year = self.get_year()
        month = self.get_month()
        day = self.get_day()
        filter_date = date_from_string(year, self.get_year_format(),
                                 month, self.get_month_format(),
                                 day, self.get_day_format())
        team_daily_reports = DailyReport.objects.filter(organization=organization, which_date=filter_date).order_by('published_datetime')
        members = [om.user for om in OrganizationMember.objects.get_members(organization)]
        report_users = [report.owner for report in team_daily_reports]
        submit_count = len(set(report_users) & set(members))
        not_submit_count = len(members) - submit_count

        context = {
            'active_nav': 'daily_report',
            'active_tab': 'team',
            'selected_years': self._get_selected_years(),
            'filter_date': filter_date,
            'members': members,
            'submit_count': submit_count,
            'not_submit_count': not_submit_count,
            'team_daily_reports': team_daily_reports
        }
        template_name = 'organization/workreport/daily/calendar_team_report.html'
        return self.respond(template_name, context)

    def _get_selected_years(self):
        now = get_local_datetime_now()
        years = []
        for i in [0, 1, 2, 3]:
            years.append(now.year - i)
        return years


class DailyReportMembersIndexView(OrganizationView):
    def get(self, request, organization, *args, **kwargs):
        context = {
            'active_tab': 'member'
        }
        return self.respond('organization/workreport/daily/members_index.html', context)



class AjaxWorkreportStatisticView(JSONResponseMixin, OrganizationView):
    def get(self, request, organization, *args, **kwargs):
        self.organization = organization
        statistic = self.get_work_report_statistic(request)

        context = {
            'calendar': statistic
        }
        return self.render_json_response(context)

    def get_query(self, start_date, end_date, is_team, report_type, report_user=None):
        report_status_list = []
        if is_team:
            def _extract_date(entity):
                'extracts the starting date from an entity'
                return entity.which_date

            reports = DailyReport.objects.filter(organization=self.organization, which_date__range=(start_date, end_date)).order_by('which_date')
            members = [member.user for member in OrganizationMember.objects.get_members(self.organization)]
            for which_date, group in groupby(reports, key=_extract_date):
                users = []
                for report in group:
                    users.append(report.owner)
                m = list(set(users) & set(members))
                if len(m) >= len(members):
                    status = WORKREPORT_STATUS_TEAM_COMPLETE
                elif 0 < len(m) < len(members):
                    status = WORKREPORT_STATUS_TEAM_PARTCOMPLETE
                else:
                    status = WORKREPORT_STATUS_TEAM_INCOMPLETE
                report_status_list.append({
                    'date': which_date.strftime('%Y/%m/%d'),
                    'status': status
                })
        else:
            reports = DailyReport.objects.filter(organization=self.organization, owner=report_user, which_date__range=(start_date, end_date))
            for report in reports:
                report_status_list.append({
                    'date': report.which_date.strftime('%Y/%m/%d'),
                    'status': report.report_status
                })

        return report_status_list

    def get_work_report_statistic(self, request):
        year = int(request.GET.get('year'))
        month = int(request.GET.get('month'))
        is_team = bool(int(request.GET.get('isTeam', 0)))
        report_type = request.GET.get('reportType', 'daily')
        report_user = None
        if not is_team:
            report_user = get_object_or_404(User, username__iexact=request.GET.get('reportUser'))
        date_list = []
        first_weekday = get_calendar_first_weekday()
        for d in calendar.Calendar(first_weekday).itermonthdates(year, month):
            date_list.append(d)

        if len(date_list) < 42:
            last_date = date_list[-1]
            for i in range(1, 8):
                date_list.append(last_date + datetime.timedelta(i))

        queryset = self.get_query(date_list[0], date_list[-1], is_team, report_type, report_user=report_user)
        statistic = []
        for d in date_list:
            obj = {
                'date': d.strftime('%Y/%m/%d'),
                'status': WORKREPORT_STATUS_INCOMPLETE
            }
            if d > get_local_datetime_now().date():
                obj['status'] = WORKREPORT_STATUS_DEFAULT
            for q in queryset:
                if q.get('date') == d.strftime('%Y/%m/%d'):
                    obj['status'] = q.get('status')
            statistic.append(obj)

        return statistic

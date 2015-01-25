from __future__ import absolute_import

import logging

from django.core.signals import request_finished
from django.db import models

from celery.signals import task_postrun

from cobra.core.cache import cache
from cobra.core.loading import get_model
from cobra.models import BaseManager
from .utils import ProjectStatus


class ProjectManager(BaseManager):
    # TODO(dcramer): we might want to cache this per user
    def get_for_user(self, team, user, access=None, _skip_team_check=False):
        Team = get_model('team', 'Team')

        if not (user and user.is_authenticated()):
            return []

        if not _skip_team_check:
            team_list = Team.objects.get_for_user(
                organization=team.organization,
                user=user,
                access=access,
            )

            try:
                team = team_list[team_list.index(team)]
            except ValueError:
                logging.info('User does not have access to team: %s', team.id)
                return []

        # Identify access groups
        if getattr(team, 'is_access_group', False):
            logging.warning('Team is using deprecated access groups: %s', team.id)
            # base_qs = Project.objects.filter(
            base_qs = self.filter(
                accessgroup__team=team,
                accessgroup__members=user,
                status=ProjectStatus.VISIBLE,
            )
        else:
            base_qs = self.filter(
                team=team,
                status=ProjectStatus.VISIBLE,
            )

        project_list = []
        for project in base_qs:
            project.team = team
            project_list.append(project)

        return sorted(project_list, key=lambda x: x.name.lower())


class ProjectOptionManager(BaseManager):
    def __init__(self, *args, **kwargs):
        super(ProjectOptionManager, self).__init__(*args, **kwargs)
        self.__cache = {}

    def __getstate__(self):
        d = self.__dict__.copy()
        # we cant serialize weakrefs
        d.pop('_ProjectOptionManager__cache', None)
        return d

    def __setstate__(self, state):
        self.__dict__.update(state)
        self.__cache = {}

    def _make_key(self, instance_id):
        return '%s:%s' % (self.model._meta.db_table, instance_id)

    def get_value_bulk(self, instances, key):
        instance_map = dict((i.id, i) for i in instances)
        queryset = self.filter(
            project__in=instances,
            key=key,
        )
        result = dict((i, None) for i in instances)
        for obj in queryset:
            result[instance_map[obj.project_id]] = obj.value
        return result

    def get_value(self, project, key, default=None):
        result = self.get_all_values(project)
        return result.get(key, default)

    def unset_value(self, project, key):
        self.filter(project=project, key=key).delete()
        self.reload_cache(project.id)

    def set_value(self, project, key, value):
        self.create_or_update(
            project=project,
            key=key,
            defaults={
                'value': value,
            },
        )
        self.reload_cache(project.id)

    def get_all_values(self, project):
        if isinstance(project, models.Model):
            project_id = project.id
        else:
            project_id = project

        if project_id not in self.__cache:
            cache_key = self._make_key(project_id)
            result = cache.get(cache_key)
            if result is None:
                result = self.reload_cache(project_id)
            else:
                self.__cache[project_id] = result
        return self.__cache.get(project_id, {})

    def clear_local_cache(self, **kwargs):
        self.__cache = {}

    def reload_cache(self, project_id):
        cache_key = self._make_key(project_id)
        result = dict(
            (i.key, i.value)
            for i in self.filter(project=project_id)
        )
        cache.set(cache_key, result)
        self.__cache[project_id] = result
        return result

    def post_save(self, instance, **kwargs):
        self.reload_cache(instance.project_id)

    def post_delete(self, instance, **kwargs):
        self.reload_cache(instance.project_id)

    def contribute_to_class(self, model, name):
        super(ProjectOptionManager, self).contribute_to_class(model, name)
        task_postrun.connect(self.clear_local_cache)
        request_finished.connect(self.clear_local_cache)
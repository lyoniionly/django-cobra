from django.core.signals import request_finished
from django.db import models

from celery.signals import task_postrun

from cobra.core.cache import cache
from cobra.models import BaseManager


class UserOptionManager(BaseManager):
    def __init__(self, *args, **kwargs):
        super(UserOptionManager, self).__init__(*args, **kwargs)
        self.__metadata = {}

    def __getstate__(self):
        d = self.__dict__.copy()
        # we cant serialize weakrefs
        d.pop('_UserOptionManager__metadata', None)
        return d

    def __setstate__(self, state):
        self.__dict__.update(state)
        self.__metadata = {}

    def get_value(self, user, project, key, default=None):
        result = self.get_all_values(user, project)
        return result.get(key, default)

    def unset_value(self, user, project, key):
        self.filter(user=user, project=project, key=key).delete()
        if not hasattr(self, '_metadata'):
            return
        if project:
            metakey = (user.pk, project.pk)
        else:
            metakey = (user.pk, None)
        if metakey not in self.__metadata:
            return
        self.__metadata[metakey].pop(key, None)

    def set_value(self, user, project, key, value):
        inst, created = self.get_or_create(
            user=user,
            project=project,
            key=key,
            defaults={
                'value': value,
            },
        )
        if not created and inst.value != value:
            inst.update(value=value)

        if project:
            metakey = (user.pk, project.pk)
        else:
            metakey = (user.pk, None)
        if metakey not in self.__metadata:
            return
        self.__metadata[metakey][key] = value

    def get_all_values(self, user, project):
        if project:
            metakey = (user.pk, project.pk)
        else:
            metakey = (user.pk, None)
        if metakey not in self.__metadata:
            result = dict(
                (i.key, i.value) for i in
                self.filter(
                    user=user,
                    project=project,
                )
            )
            self.__metadata[metakey] = result
        return self.__metadata.get(metakey, {})

    def clear_cache(self, **kwargs):
        self.__metadata = {}

    def contribute_to_class(self, model, name):
        super(UserOptionManager, self).contribute_to_class(model, name)
        task_postrun.connect(self.clear_cache)
        request_finished.connect(self.clear_cache)


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
        assert instance_id
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
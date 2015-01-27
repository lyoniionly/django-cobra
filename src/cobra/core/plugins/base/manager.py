
from __future__ import absolute_import, print_function

__all__ = ('PluginManager',)

import logging

from cobra.core.managers import InstanceManager
from cobra.core.safe import safe_execute


class PluginManager(InstanceManager):
    def __iter__(self):
        return iter(self.all())

    def __len__(self):
        return sum(1 for i in self.all())

    def all(self, version=1):
        for plugin in sorted(super(PluginManager, self).all(), key=lambda x: x.get_title()):
            if not plugin.is_enabled():
                continue
            if version is not None and plugin.__version__ != version:
                continue
            yield plugin

    def for_project(self, project, version=1):
        for plugin in self.all(version=version):
            if not safe_execute(plugin.is_enabled, project):
                continue
            yield plugin

    def for_site(self, version=1):
        for plugin in self.all(version=version):
            if not plugin.has_site_conf():
                continue
            yield plugin

    def get(self, slug):
        for plugin in self.all():
            if plugin.slug == slug:
                return plugin
        raise KeyError(slug)

    def first(self, func_name, *args, **kwargs):
        for plugin in self.all():
            try:
                result = getattr(plugin, func_name)(*args, **kwargs)
            except Exception as e:
                logger = logging.getLogger('cobra.plugins')
                logger.error('Error processing %s() on %r: %s', func_name, plugin.__class__, e, extra={
                    'func_arg': args,
                    'func_kwargs': kwargs,
                }, exc_info=True)
                continue

            if result is not None:
                return result

    def register(self, cls):
        self.add('%s.%s' % (cls.__module__, cls.__name__))
        return cls

    def unregister(self, cls):
        self.remove('%s.%s' % (cls.__module__, cls.__name__))
        return cls

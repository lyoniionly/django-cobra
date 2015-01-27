
from __future__ import absolute_import

from cobra.core.constants import MAX_TAG_VALUE_LENGTH
from cobra.core.plugins import Plugin
from cobra.core.loading import get_model

Group = get_model('group', 'Group')

class TagPlugin(Plugin):
    tag = None
    tag_label = None
    project_default_enabled = True

    def get_tag_values(self, event, **kwargs):
        """
        Must return a list of values.

        >>> get_tag_pairs(event)
        [tag1, tag2, tag3]
        """
        raise NotImplementedError

    def get_tags(self, event, **kwargs):
        return [
            (self.tag, v)
            for v in self.get_tag_values(event)
            if len(v) <= MAX_TAG_VALUE_LENGTH
        ]

    def post_process(self, group, event, is_new, is_sample, **kwargs):
        # legacy compatibility for older plugins
        if not hasattr(Plugin, 'get_tags'):
            Group.objects.add_tags(group, self.get_tags(event))

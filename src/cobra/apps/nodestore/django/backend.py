
from __future__ import absolute_import

from django.utils import timezone

from cobra.models import create_or_update
from cobra.apps.nodestore.base import NodeStorage
from cobra.apps.nodestore.models import Node


class DjangoNodeStorage(NodeStorage):
    def delete(self, id):
        Node.objects.filter(id=id).delete()

    def get(self, id):
        try:
            return Node.objects.get(id=id).data
        except Node.DoesNotExist:
            return None

    def get_multi(self, id_list):
        return dict(
            (n.id, n.data)
            for n in Node.objects.filter(id__in=id_list)
        )

    def set(self, id, data):
        create_or_update(
            Node,
            id=id,
            defaults={
                'data': data,
                'timestamp': timezone.now(),
            },
        )

    def cleanup(self, cutoff_timestamp):
        Node.objects.filter(timestamp__lte=cutoff_timestamp).delete()

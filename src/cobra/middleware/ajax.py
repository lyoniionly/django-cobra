from __future__ import absolute_import

import json

from django.conf import settings
from django.contrib import messages

class AjaxMessagingMiddleware(object):
    def process_response(self, request, response):
        if request.is_ajax():
            if response['Content-Type'] in ["application/javascript", "application/json"]:
                try:
                    content = {}
                    json_data = json.loads(response.content)
                    if not isinstance(json_data, dict):
                        content[settings.COBRA_JSON_DATA_ROOT] = json_data
                    else:
                        content = json_data
                except ValueError:
                    return response

                django_messages = []

                for message in messages.get_messages(request):
                    django_messages.append({
                        "level": message.level,
                        "message": message.message,
                        "extra_tags": message.tags,
                    })

                content['django_messages'] = django_messages

                response.content = json.dumps(content)
        return response
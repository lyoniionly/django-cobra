from __future__ import absolute_import, print_function

import logging

from django.core.mail import get_connection

from .base import instrumented_task
from cobra.core.compat import get_user_model
from cobra.core.loading import get_model, get_class

logger = logging.getLogger(__name__)


def _get_user_from_email(group, email):
    User = get_user_model()
    Project = get_model('project', 'Project')
    # TODO(dcramer): we should encode the userid in emails so we can avoid this

    for user in User.objects.filter(email__iexact=email):
        # Make sure that the user actually has access to this project
        if group.project not in Project.objects.get_for_user(
                team=group.team, user=user):
            logger.warning('User %r does not have access to group %r', user, group)
            continue

        return user


@instrumented_task(
    name='cobra.tasks.email.process_inbound_email',
    queue='email')
def process_inbound_email(mailfrom, group_id, payload):
    """
    """
    Event = get_model('event', 'Event')
    Group = get_model('group', 'Group')
    NewNoteForm = get_class('note.forms', 'NewNoteForm')

    try:
        group = Group.objects.select_related('project', 'team').get(pk=group_id)
    except Group.DoesNotExist:
        logger.warning('Group does not exist: %d', group_id)
        return

    user = _get_user_from_email(group, mailfrom)
    if user is None:
        logger.warning('Inbound email from unknown address: %s', mailfrom)
        return

    event = group.get_latest_event() or Event()

    Event.objects.bind_nodes([event], 'data')
    event.group = group
    event.project = group.project

    form = NewNoteForm({'text': payload})
    if form.is_valid():
        form.save(event, user)


@instrumented_task(
    name='cobra.tasks.email.send_email',
    queue='email')
def send_email(message):
    connection = get_connection()
    connection.send_messages([message])

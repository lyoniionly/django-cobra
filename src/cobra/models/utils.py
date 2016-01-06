from __future__ import absolute_import

import operator

from uuid import uuid4

from django.db.models import F
from django.db.models.expressions import Expression, Value, CombinedExpression
from django.template.defaultfilters import slugify

from cobra.core.exceptions import CannotResolveExpression


EXPRESSION_NODE_CALLBACKS = {
    Expression.ADD: operator.add,
    Expression.SUB: operator.sub,
    Expression.MUL: operator.mul,
    Expression.DIV: operator.div,
    Expression.MOD: operator.mod,
}
try:
    EXPRESSION_NODE_CALLBACKS[Expression.AND] = operator.and_
except AttributeError:
    EXPRESSION_NODE_CALLBACKS[Expression.BITAND] = operator.and_
try:
    EXPRESSION_NODE_CALLBACKS[Expression.OR] = operator.or_
except AttributeError:
    EXPRESSION_NODE_CALLBACKS[Expression.BITOR] = operator.or_


def resolve_expression_node(instance, node):
    # Update by lyon.
    def _resolve(instance, node):
        if isinstance(node, F):
            return getattr(instance, node.name)
        # elif isinstance(node, Value):
        #     return node.value
        elif isinstance(node, CombinedExpression):
            return resolve_expression_node(instance, node)
        return node

    op = EXPRESSION_NODE_CALLBACKS.get(node.connector, None)
    if not op:
        raise CannotResolveExpression
    # runner = _resolve(instance, node.children[0])
    runner = _resolve(instance, node.lhs)
    # for n in node.children[1:]:
    #     runner = op(runner, _resolve(instance, n))
    runner = op(runner, _resolve(instance, node.rhs))
    return runner


def slugify_instance(inst, label, reserved=(), max_length=30, *args, **kwargs):
    base_slug = slugify(label)[:max_length]

    if base_slug in reserved:
        base_slug = None
    elif base_slug is not None:
        base_slug = base_slug.strip()

    if not base_slug:
        base_slug = uuid4().hex[:12]

    base_qs = type(inst).objects.all()
    if inst.id:
        base_qs = base_qs.exclude(id=inst.id)
    if args or kwargs:
        base_qs = base_qs.filter(*args, **kwargs)

    inst.slug = base_slug
    n = 0
    while base_qs.filter(slug__iexact=inst.slug).exists():
        n += 1
        inst.slug = base_slug[:max_length - len(str(n)) - 1] + '-' + str(n)

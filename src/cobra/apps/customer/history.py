import json

from django.conf import settings
from cobra.core.loading import get_model

from cobra.core.loading import get_class

product_viewed = get_class('catalogue.signals', 'product_viewed')


def get(request):
    """
    Return a list of recently viewed products
    """
    ids = extract(request)

    # Needs to live in local scope because receivers in this module get
    # registered during model initialisation
    # TODO Move this back to global scope once Django < 1.7 support is removed
    Product = get_model('catalogue', 'Product')

    # Reordering as the ID order gets messed up in the query
    product_dict = Product.browsable.in_bulk(ids)
    ids.reverse()
    return [product_dict[id] for id in ids if id in product_dict]


def extract(request, response=None):
    """
    Extract the IDs of products in the history cookie
    """
    ids = []
    cookie_name = settings.OSCAR_RECENTLY_VIEWED_COOKIE_NAME
    if cookie_name in request.COOKIES:
        try:
            ids = json.loads(request.COOKIES[cookie_name])
        except ValueError:
            # This can occur if something messes up the cookie
            if response:
                response.delete_cookie(cookie_name)
        else:
            # Badly written web crawlers send garbage in double quotes
            if not isinstance(ids, list):
                ids = []
    return ids


def add(ids, new_id):
    """
    Add a new product ID to the list of product IDs
    """
    max_products = settings.OSCAR_RECENTLY_VIEWED_PRODUCTS
    if new_id in ids:
        ids.remove(new_id)
    ids.append(new_id)
    if (len(ids) > max_products):
        ids = ids[len(ids) - max_products:]
    return ids


def update(product, request, response):
    """
    Updates the cookies that store the recently viewed products
    removing possible duplicates.
    """
    ids = extract(request, response)
    updated_ids = add(ids, product.id)
    response.set_cookie(
        settings.OSCAR_RECENTLY_VIEWED_COOKIE_NAME,
        json.dumps(updated_ids),
        max_age=settings.OSCAR_RECENTLY_VIEWED_COOKIE_LIFETIME,
        httponly=True)
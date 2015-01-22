from django.conf import settings
from cobra.core.loading import get_model
from django.db.models.signals import post_save


def send_product_alerts(sender, instance, created, **kwargs):
    if kwargs.get('raw', False):
        return
    from cobra.apps.customer.alerts import utils
    utils.send_product_alerts(instance.product)


# if settings.COBRA_EAGER_ALERTS:
#     StockRecord = get_model('partner', 'StockRecord')
#     post_save.connect(send_product_alerts, sender=StockRecord)

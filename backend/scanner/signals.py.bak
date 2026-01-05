from django.db.models.signals import post_save
from django.dispatch import receiver

from graphene_subscriptions.events import send_event

from scanner.models import ScanLog


@receiver(post_save, sender=ScanLog)
def publish_scan_completed(sender, instance, created, **kwargs):
    """
    Fires when a scan result is stored.
    Publishes a GraphQL subscription event.
    """
    if not created:
        return

    send_event(
        "scan_completed",
        instance=instance,
    )

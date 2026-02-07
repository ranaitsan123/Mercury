from django.db.models.signals import post_save
from django.dispatch import receiver

from scanner.models import ScanLog


@receiver(post_save, sender=ScanLog)
def scanlog_post_save(sender, instance, created, **kwargs):
    """
    Fires when a ScanLog is created.

    Transport-agnostic domain event.
    """
    if not created:
        return

    # ✅ Future-safe hooks:
    # - notifications
    # - risk metrics
    # - alerting
    # - async workflows

    return

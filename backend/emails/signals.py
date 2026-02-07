from django.db.models.signals import post_save
from django.dispatch import receiver

from emails.models import Email


@receiver(post_save, sender=Email)
def email_post_save(sender, instance, created, **kwargs):
    """
    Fires when an Email is created.

    This is a DOMAIN EVENT, not a transport mechanism.
    No GraphQL subscriptions.
    No WebSockets.
    """
    if not created:
        return

    # ✅ Future-safe hooks (examples):
    # - auto scan trigger
    # - audit logging
    # - metrics
    # - notifications (later)

    # For now, do nothing
    return

from django.db.models.signals import post_save
from django.dispatch import receiver

from emails.models import Email


@receiver(post_save, sender=Email)
def on_email_created(sender, instance, created, **kwargs):
    """
    Fires when a new email is created (inbox or sent).

    Subscription publishing has been removed.
    This signal can later be used for:
    - logging
    - audit trails
    - async tasks
    - realtime polling support
    """
    if not created:
        return

    # Placeholder for future logic
    # Example:
    # logger.info(f"Email created: {instance.id}")
    pass

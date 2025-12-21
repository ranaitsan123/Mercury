from django.db.models.signals import post_save
from django.dispatch import receiver

from graphene_subscriptions.events import send_event

from emails.models import Email


@receiver(post_save, sender=Email)
def publish_email_created(sender, instance, created, **kwargs):
    """
    Fires when a new email is created (inbox or sent).
    Publishes a GraphQL subscription event.
    """
    if not created:
        return

    send_event(
        "email_created",
        instance=instance,
    )

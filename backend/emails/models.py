from django.conf import settings
from django.db import models

class Email(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="emails"
    )

    sender = models.EmailField()
    recipient = models.EmailField(null=True, blank=True)

    subject = models.CharField(max_length=255)
    body = models.TextField()

    # Inbox logic
    folder = models.CharField(
        max_length=20,
        choices=[("inbox", "Inbox"), ("sent", "Sent")],
        default="inbox"
    )

    is_outgoing = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Email from {self.sender} to {self.recipient} - {self.subject}"
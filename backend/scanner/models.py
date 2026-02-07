from django.conf import settings
from django.db import models

class ScanLog(models.Model):
    email = models.OneToOneField(
        "emails.Email",
        related_name="scan",
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    result = models.CharField(max_length=50)
    confidence = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"ScanLog for Email ID {self.email.id} - Result: {self.result}"
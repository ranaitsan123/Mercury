from django.db import models

class ScanLog(models.Model):
    sender = models.CharField(max_length=255, blank=True, null=True)
    subject = models.CharField(max_length=255, blank=True, null=True)
    body = models.TextField(blank=True, null=True)
    result = models.CharField(max_length=50)  # e.g., "safe" or "malicious"
    confidence = models.FloatField(default=0.0)
    scanned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} - {self.subject} ({self.result})"

from django.conf import settings
from django.db import models


class GraphQLAuditLog(models.Model):
    trace_id = models.CharField(max_length=64, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    query = models.TextField()
    variables = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"GraphQLAuditLog(trace_id={self.trace_id})"

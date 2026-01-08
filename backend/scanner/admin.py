from django.contrib import admin
from .models import ScanLog


@admin.register(ScanLog)
class ScanLogAdmin(admin.ModelAdmin):
    list_display = (
        "email_sender",
        "email_subject",
        "result",
        "confidence",
        "created_at",
    )

    list_filter = (
        "result",
        "created_at",
    )

    search_fields = (
        "email__sender",
        "email__subject",
        "email__body",
    )

    ordering = ("-created_at",)

    # -----------------------------
    # Custom display methods
    # -----------------------------
    def email_sender(self, obj):
        return obj.email.sender

    email_sender.short_description = "Sender"

    def email_subject(self, obj):
        return obj.email.subject

    email_subject.short_description = "Subject"

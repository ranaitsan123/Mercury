from django.contrib import admin
from .models import ScanLog

@admin.register(ScanLog)
class ScanLogAdmin(admin.ModelAdmin):
    list_display = ("sender", "subject", "result", "confidence", "scanned_at")
    list_filter = ("result", "scanned_at")
    search_fields = ("sender", "subject", "body")

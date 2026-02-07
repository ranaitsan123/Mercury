from django.contrib import admin
from .models import Email

@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):
    list_display = ("id", "sender", "subject", "created_at")
    search_fields = ("sender", "subject", "body")
    list_filter = ("created_at",)

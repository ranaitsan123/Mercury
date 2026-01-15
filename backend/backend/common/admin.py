# backend/common/admin.py
from django.contrib import admin
from backend.common.models import GraphQLAuditLog

@admin.register(GraphQLAuditLog)
class GraphQLAuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user", "trace_id")
    search_fields = ("trace_id", "query")
    ordering = ("-created_at",)

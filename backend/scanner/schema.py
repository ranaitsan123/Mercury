import graphene
from graphene_django import DjangoObjectType

from backend.common.graphql_permissions import login_required, admin_required
from scanner.models import ScanLog


# =====================
# TYPES
# =====================

class ScanLogType(DjangoObjectType):
    class Meta:
        model = ScanLog
        fields = (
            "id",
            "result",
            "confidence",
            "created_at",
            "email",
        )


# =====================
# QUERIES
# =====================

class Query(graphene.ObjectType):
    scan_logs = graphene.List(
        ScanLogType,
        result=graphene.String(),
        limit=graphene.Int(default_value=50),
        offset=graphene.Int(default_value=0),
    )

    my_scan_logs = graphene.List(
        ScanLogType,
        limit=graphene.Int(default_value=50),
        offset=graphene.Int(default_value=0),
    )

    @login_required
    @admin_required
    def resolve_scan_logs(self, info, result=None, limit=50, offset=0):
        qs = ScanLog.objects.all().order_by("-created_at")
        if result:
            qs = qs.filter(result=result)
        return qs[offset:offset + limit]

    @login_required
    def resolve_my_scan_logs(self, info, limit=50, offset=0):
        return (
            ScanLog.objects
            .filter(user=info.context.user)
            .order_by("-created_at")[offset:offset + limit]
        )

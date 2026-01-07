from functools import wraps
import uuid

from backend.common.models import GraphQLAuditLog  # adjust path if needed


class GraphQLMiddleware:
    """
    Middleware for GraphQL:
    - Reuses Django trace_id (single source of truth)
    - Global authentication
    - Cursor/pagination limit
    - Stores each query in GraphQLAuditLog
    """

    def __init__(self, query_limit=50):
        self.query_limit = query_limit

    def resolve(self, next, root, info, **kwargs):
        request = info.context  # This IS the Django HttpRequest

        # --------------------------------------------------
        # ✅ TRACE ID (REUSE, DO NOT RECREATE)
        # --------------------------------------------------
        if hasattr(request, "trace_id"):
            trace_id = request.trace_id
        else:
            # Safety fallback (should rarely happen)
            trace_id = uuid.uuid4().hex
            request.trace_id = trace_id

        # Make it accessible everywhere in GraphQL
        info.context.trace_id = trace_id

        # --------------------------------------------------
        # AUTHENTICATION
        # --------------------------------------------------
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            raise Exception("Authentication required")

        # --------------------------------------------------
        # QUERY LIMIT (Relay-style `first`)
        # --------------------------------------------------
        first = kwargs.get("first")
        if first and first > self.query_limit:
            raise Exception(
                f"Query limit exceeded: max {self.query_limit} items allowed"
            )

        # --------------------------------------------------
        # AUDIT LOGGING
        # --------------------------------------------------
        GraphQLAuditLog.objects.create(
            trace_id=trace_id,
            user=user,
            query=str(getattr(info, "operation", None) or request.body),
            variables=kwargs,
        )

        return next(root, info, **kwargs)


# --------------------------------------------------
# OPTIONAL FIELD-LEVEL DECORATORS
# --------------------------------------------------

def admin_required(fn):
    """
    Ensures user is authenticated and has role='admin'
    """
    @wraps(fn)
    def wrapper(root, info, **kwargs):
        request = info.context
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            raise Exception("Authentication required")

        if getattr(user, "role", None) != "admin":
            raise Exception("Admins only")

        return fn(root, info, **kwargs)

    return wrapper

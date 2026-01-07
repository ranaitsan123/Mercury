from functools import wraps
import uuid

from graphql import GraphQLError

from backend.common.models import GraphQLAuditLog


# ==================================================
# GraphQL Error Definitions (local & explicit)
# ==================================================

class AuthRequiredError(GraphQLError):
    def __init__(self):
        super().__init__(
            message="Authentication required",
            extensions={"code": "AUTH_REQUIRED"},
        )


class PermissionDeniedError(GraphQLError):
    def __init__(self):
        super().__init__(
            message="Permission denied",
            extensions={"code": "PERMISSION_DENIED"},
        )


class QueryLimitExceededError(GraphQLError):
    def __init__(self, limit):
        super().__init__(
            message=f"Query limit exceeded (max {limit} items allowed)",
            extensions={
                "code": "QUERY_LIMIT_EXCEEDED",
                "max_limit": limit,
            },
        )


# ==================================================
# GraphQL Middleware
# ==================================================

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
        request = info.context  # Django HttpRequest

        # --------------------------------------------------
        # TRACE ID (REUSE DJANGO TRACE ID)
        # --------------------------------------------------
        if hasattr(request, "trace_id"):
            trace_id = request.trace_id
        else:
            # Safety fallback (should rarely happen)
            trace_id = uuid.uuid4().hex
            request.trace_id = trace_id

        # Make trace_id available everywhere in GraphQL
        info.context.trace_id = trace_id

        # --------------------------------------------------
        # AUTHENTICATION
        # --------------------------------------------------
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            raise AuthRequiredError()

        # --------------------------------------------------
        # QUERY LIMIT (Relay-style `first`)
        # --------------------------------------------------
        first = kwargs.get("first")
        if first and first > self.query_limit:
            raise QueryLimitExceededError(self.query_limit)

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


# ==================================================
# FIELD-LEVEL DECORATORS
# ==================================================

def admin_required(fn):
    """
    Ensures user is authenticated and has role='admin'
    """

    @wraps(fn)
    def wrapper(root, info, **kwargs):
        request = info.context
        user = getattr(request, "user", None)

        if not user or not user.is_authenticated:
            raise AuthRequiredError()

        if getattr(user, "role", None) != "admin":
            raise PermissionDeniedError()

        return fn(root, info, **kwargs)

    return wrapper


from functools import wraps
import uuid

from backend.common.models import GraphQLAuditLog
from backend.common.graphql_errors import (
    AuthRequiredError,
    PermissionDeniedError,
    QueryLimitExceededError,
)


class GraphQLMiddleware:
    """
    GraphQL Middleware:
    - Reuses Django trace_id (single source of truth)
    - Enforces authentication globally
    - Enforces pagination limits
    - Stores every GraphQL operation in GraphQLAuditLog
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

        # Expose trace_id to resolvers
        info.context.trace_id = trace_id

        # --------------------------------------------------
        # AUTHENTICATION (GLOBAL)
        # --------------------------------------------------
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            raise AuthRequiredError()

        # --------------------------------------------------
        # QUERY LIMIT (Relay-style `first`)
        # --------------------------------------------------
        first = kwargs.get("first")
        if first is not None and first > self.query_limit:
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
# FIELD-LEVEL DECORATORS (OPTIONAL OVERRIDES)
# ==================================================

def admin_required(fn):
    """
    Ensures the user is authenticated and has role='admin'
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

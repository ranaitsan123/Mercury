import uuid
from functools import wraps
from backend.common.models import GraphQLAuditLog  # adjust path to your models

class GraphQLMiddleware:
    """
    Middleware for GraphQL:
    - trace_id for audit logging
    - global authentication
    - cursor/pagination limit
    - stores each query in GraphQLAuditLog
    """

    def __init__(self, query_limit=50):
        self.query_limit = query_limit

    def resolve(self, next, root, info, **kwargs):
        # Assign a trace_id for audit logging
        trace_id = str(uuid.uuid4())
        info.context.trace_id = trace_id

        user = getattr(info.context, "user", None)

        # Global authentication
        if not user or not user.is_authenticated:
            raise Exception("Authentication required")

        # Enforce query limit (Relay-style 'first' argument)
        first = kwargs.get("first")
        if first and first > self.query_limit:
            raise Exception(f"Query limit exceeded: max {self.query_limit} items allowed")

        # Store query in audit log
        GraphQLAuditLog.objects.create(
            trace_id=trace_id,
            user=user if user.is_authenticated else None,
            query=getattr(info, "operation", None) or str(info.context.body),
            variables=kwargs
        )

        return next(root, info, **kwargs)


# -------------------------------
# Optional field-level decorators
# -------------------------------

def admin_required(fn):
    """
    Ensures user is authenticated and has role='admin'
    """
    @wraps(fn)
    def wrapper(root, info, **kwargs):
        user = getattr(info.context, "user", None)
        if not user or not user.is_authenticated:
            raise Exception("Authentication required")
        if getattr(user, "role", None) != "admin":
            raise Exception("Admins only")
        return fn(root, info, **kwargs)
    return wrapper

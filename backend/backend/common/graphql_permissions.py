from functools import wraps

from backend.common.graphql_errors import (
    AuthRequiredError,
    PermissionDeniedError,
)


def login_required(fn):
    """
    Ensures the user is authenticated in GraphQL resolvers
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        info = args[1]  # (root/self, info, ...)
        user = getattr(info.context, "user", None)

        if not user or not user.is_authenticated:
            raise AuthRequiredError()

        return fn(*args, **kwargs)

    return wrapper


def admin_required(fn):
    """
    Ensures the user is authenticated AND has role='admin'
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        info = args[1]
        user = getattr(info.context, "user", None)

        if not user or not user.is_authenticated:
            raise AuthRequiredError()

        if getattr(user, "role", None) != "admin":
            raise PermissionDeniedError()

        return fn(*args, **kwargs)

    return wrapper

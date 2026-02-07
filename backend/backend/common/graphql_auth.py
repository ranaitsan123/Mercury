# This file is ONLY for GraphQL permission helpers

def require_admin(user):
    if not user or not user.is_authenticated:
        raise Exception("Authentication required")

    if user.role != "admin":
        raise Exception("Admins only")

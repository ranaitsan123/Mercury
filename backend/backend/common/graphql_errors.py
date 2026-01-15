from graphql import GraphQLError


class AuthRequiredError(GraphQLError):
    def __init__(self):
        super().__init__(
            message="Authentication required",
            extensions={
                "code": "AUTH_REQUIRED"
            }
        )


class PermissionDeniedError(GraphQLError):
    def __init__(self):
        super().__init__(
            message="Permission denied",
            extensions={
                "code": "PERMISSION_DENIED"
            }
        )


class QueryLimitExceededError(GraphQLError):
    def __init__(self, limit):
        super().__init__(
            message=f"Query limit exceeded (max {limit})",
            extensions={
                "code": "QUERY_LIMIT_EXCEEDED",
                "max_limit": limit,
            }
        )

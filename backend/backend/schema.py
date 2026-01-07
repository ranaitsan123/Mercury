import graphene
import graphql_jwt

from emails.schema import (
    Query as EmailQuery,
    Mutation as EmailMutation,
)

from scanner.schema import Query as ScannerQuery


# =====================
# ROOT QUERY
# =====================
class Query(
    EmailQuery,
    ScannerQuery,
    graphene.ObjectType,
):
    """
    Frontend-facing GraphQL queries:
    - Inbox emails
    - Scan logs
    """
    pass


# =====================
# ROOT MUTATION
# =====================
class Mutation(
    EmailMutation,
    graphene.ObjectType,
):
    """
    Frontend-facing GraphQL mutations:
    - sendEmail
    - JWT authentication
    """

    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()


# =====================
# SCHEMA
# =====================
schema = graphene.Schema(
    query=Query,
    mutation=Mutation,
)

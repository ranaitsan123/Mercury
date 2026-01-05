import graphene
import graphql_jwt

from emails.schema import (
    Query as EmailQuery,
    Mutation as EmailMutation,
)

from scanner.schema import Query as ScannerQuery

from graphene_subscriptions.subscription import Subscription

# =====================
# ROOT QUERY
# =====================
class Query(
    EmailQuery,
    ScannerQuery,
    graphene.ObjectType,
):
    """
    Frontend-facing queries:
    - Inbox
    - Email detail
    - Scan results (read-only)
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
    Frontend-facing mutations:
    - sendEmail
    - JWT auth
    """

    # JWT auth (required)
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()


# =====================
# SCHEMA
# =====================
schema = graphene.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription,
)

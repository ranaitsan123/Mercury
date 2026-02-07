import graphene
from graphene_django import DjangoObjectType

from backend.common.graphql_permissions import login_required
from emails.models import Email
from scanner.models import ScanLog
from emails.mock_service import mock_service
from scanner.service_selector import try_real_send_email


# =====================
# TYPES
# =====================

class ScanLogType(DjangoObjectType):
    class Meta:
        model = ScanLog
        fields = ("result", "confidence", "created_at")


class EmailType(DjangoObjectType):
    scan = graphene.Field(ScanLogType)

    class Meta:
        model = Email
        fields = (
            "id",
            "sender",
            "recipient",
            "subject",
            "body",
            "folder",
            "created_at",
        )

    def resolve_scan(self, info):
        return (
            ScanLog.objects
            .filter(email=self)
            .order_by("-created_at")
            .first()
        )


# =====================
# QUERIES
# =====================

class Query(graphene.ObjectType):
    my_emails = graphene.List(
        EmailType,
        folder=graphene.String(default_value="inbox"),
        limit=graphene.Int(default_value=50),
        offset=graphene.Int(default_value=0),
    )

    @login_required
    def resolve_my_emails(self, info, folder, limit, offset):
        return (
            Email.objects
            .filter(user=info.context.user, folder=folder)
            .order_by("-created_at")[offset:offset + limit]
        )


# =====================
# MUTATIONS
# =====================

from emails.services import EmailCreationService

class SendEmail(graphene.Mutation):
    class Arguments:
        to = graphene.String(required=True)
        subject = graphene.String(required=True)
        body = graphene.String(required=True)

    email = graphene.Field(EmailType)

    @login_required
    def mutate(self, info, to, subject, body):
        user = info.context.user

        email = EmailCreationService.create_and_scan_email(
            user=user,
            sender=user.email,
            recipient=to,
            subject=subject,
            body=body,
            folder="sent",
            is_outgoing=True,
            service_route=info.context.service_route,
        )

        return SendEmail(email=email)

class Mutation(graphene.ObjectType):
    send_email = SendEmail.Field()

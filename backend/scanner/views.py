from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from emails.models import Email
from scanner.models import ScanLog
from scanner.service_selector import try_real_scan
from emails.mock_service import mock_service
from scanner.service_selector import try_real_send_email


class SendEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        to = request.data.get("to")
        subject = request.data.get("subject")
        body = request.data.get("body")

        route = request.service_route.get("mailserver", "mock")

        result = (
            try_real_send_email({"to": to, "subject": subject, "body": body})
            if route == "real"
            else mock_service.send_email(to, subject, body)
        )

        Email.objects.create(
            user=request.user,
            sender=request.user.email,
            subject=subject,
            body=body,
            is_outgoing=True,
        )

        return Response({
            "status": result["status"],
            "used": route,
        })

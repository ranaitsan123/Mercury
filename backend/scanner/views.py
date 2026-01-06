from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from emails.models import Email
from scanner.models import ScanLog
from scanner.service_selector import try_real_scan
from emails.mock_service import mock_service
from scanner.service_selector import try_real_send_email

class ScanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        body = request.data.get("body", "")
        sender = request.data.get("from")
        subject = request.data.get("subject")

        # 1️⃣ Create email
        email = Email.objects.create(
            user=request.user,
            sender=sender,
            subject=subject,
            body=body,
        )

        # 2️⃣ Scan
        route = request.service_route.get("scanner", "mock")

        scan = (
            try_real_scan(body)
            if route == "real"
            else mock_service.scan_email(body)
        )

        # 3️⃣ Save scan result
        ScanLog.objects.create(
            email=email,
            user=request.user,   # ✅ FIX
            result="malicious" if scan["malicious"] else "safe",
            confidence=scan["confidence"]
        )

        return Response({
            "email_id": email.id,
            "result": scan["malicious"],
            "confidence": scan["confidence"],
            "used": route,
        })


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

from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated

# Import mock service
from emails.mock_service import mock_service
from emails.models import ScanLog

# Import real-service routers
from scanner.service_selector import try_real_scan
from scanner.service_selector import try_real_send_email

import logging
logger = logging.getLogger(__name__)


# ==========================
# 🔥 SCAN EMAIL (uses intelligent router)
# ==========================
class ScanView(APIView):
    def post(self, request):
        body = request.data.get("body", "")

        logger.info("Received scan request")

        # 🔥 Use the intelligent router
        route = request.service_route.get("scanner", "mock")

        if route == "real":
            scan_result = try_real_scan(body)
        else:
            scan_result = mock_service.scan_email(body)

        log = ScanLog.objects.create(
            sender=request.data.get("from"),
            subject=request.data.get("subject"),
            body=body,
            result="malicious" if scan_result["malicious"] else "safe",
            confidence=scan_result["confidence"]
        )

        logger.info(f"Scan result: {scan_result}")

        return Response({
            "id": log.id,
            "result": log.result,
            "confidence": log.confidence,
            "used": route,
            "trace_id": request.trace_id,
        })


# ==========================
# 🔥 SEND EMAIL (NEW)
# uses intelligent router
# ==========================
class SendEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        email_data = {
            "to": request.data.get("to"),
            "subject": request.data.get("subject"),
            "body": request.data.get("body"),
        }

        logger.info("Incoming send-email request")

        # 🔥 Select mailserver via router
        route = request.service_route.get("mailserver", "mock")

        if route == "real":
            result = try_real_send_email(email_data)
        else:
            result = mock_service.send_email(
                email_data["to"],
                email_data["subject"],
                email_data["body"]
            )

        logger.info(f"Email send result ({route}): {result}")

        return Response({
            "used": route,
            "trace_id": request.trace_id,
            **result
        })


# ==========================
# 🔥 VIEW LOGS
# ==========================
class LogsView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        logs = ScanLog.objects.order_by("-scanned_at")[:200]

        return Response([
            {
                "id": log.id,
                "sender": log.sender,
                "subject": log.subject,
                "result": log.result,
                "confidence": log.confidence,
                "scanned_at": log.scanned_at,
            }
            for log in logs
        ])

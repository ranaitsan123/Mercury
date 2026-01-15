from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .mock_service import mock_service
from .models import Email
from scanner.service_selector import try_real_send_email


class SendEmailMock(APIView):
    """
    Admin-only mock email sender
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        data = mock_service.send_email(
            to=request.data.get("to", "test@example.com"),
            subject=request.data.get("subject", "Mock Email"),
            body=request.data.get("body", "")
        )
        return Response(data)


class ScanEmailMock(APIView):
    """
    Admin-only mock email scanner
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        data = mock_service.scan_email(
            request.data.get("content", "Test content")
        )
        return Response(data)

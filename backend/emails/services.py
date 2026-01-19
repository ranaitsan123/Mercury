from django.db import transaction
from emails.models import Email
from scanner.models import ScanLog
from scanner.service_selector import try_real_scan, try_real_send_email
from emails.mock_service import mock_service


class EmailCreationService:
    @staticmethod
    @transaction.atomic
    def create_and_scan_email(
        *,
        user,
        sender,
        recipient,
        subject,
        body,
        folder,
        is_outgoing,
        service_route,
    ):
        # 1️⃣ Send email (if outgoing)
        if is_outgoing:
            if service_route["mailserver"] == "real":
                try_real_send_email({
                    "to": recipient,
                    "subject": subject,
                    "body": body,
                })
            else:
                mock_service.send_email(recipient, subject, body)

        # 2️⃣ Create Email
        email = Email.objects.create(
            user=user,
            sender=sender,
            recipient=recipient,
            subject=subject,
            body=body,
            folder=folder,
            is_outgoing=is_outgoing,
        )

        # 3️⃣ Scan (ALWAYS)
        if service_route["scanner"] == "real":
            scan = try_real_scan({
                "subject": subject,
                "body": body,
            })
        else:
            scan = mock_service.scan_email(body)


        # 4️⃣ Persist ScanLog (ONE-TO-ONE)
        ScanLog.objects.create(
            email=email,
            user=user,
            result="malicious" if scan["malicious"] else "safe",
            confidence=scan["confidence"],
        )

        return email

import pytest
from scanner.models import ScanLog
from emails.models import Email


@pytest.mark.django_db
def test_scan_creates_log(auth_client, user):
    email = Email.objects.create(
        user=user,
        sender="a@test.com",
        recipient=user.email,
        subject="Hello",
        body="Hello world",
        folder="inbox",
    )

    # Scan happens via signal in real flow,
    # but REST scan endpoint still allowed
    res = auth_client.post("/scanner/scan/", {
        "body": email.body
    })

    assert res.status_code == 200
    assert ScanLog.objects.count() == 1

    log = ScanLog.objects.first()
    assert log.user == user
    assert log.result in ["safe", "malicious"]

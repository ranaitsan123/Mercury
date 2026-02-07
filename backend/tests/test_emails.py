import pytest
from emails.models import Email


@pytest.mark.django_db
def test_mock_send_email(auth_client, user):
    res = auth_client.post("/emails/mock/send/", {
        "to": "a@b.com",
        "subject": "Hi",
        "body": "Test"
    })

    assert res.status_code == 200
    assert res.data["status"] == "sent_mock"

    assert Email.objects.count() == 1
    email = Email.objects.first()
    assert email.folder == "sent"
    assert email.is_outgoing is True

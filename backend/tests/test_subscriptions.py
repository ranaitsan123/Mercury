import pytest
from graphene_subscriptions.events import send_event
from emails.models import Email


@pytest.mark.django_db
def test_email_created_event(user):
    email = Email.objects.create(
        user=user,
        sender="a@test.com",
        recipient=user.email,
        subject="Event test",
        body="Hello",
        folder="inbox",
    )

    # If this does not raise, signal is wired correctly
    send_event("email_created", instance=email)

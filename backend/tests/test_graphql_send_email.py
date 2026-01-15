import pytest
from emails.models import Email


@pytest.mark.django_db
def test_graphql_send_email(client, user):
    mutation = """
    mutation {
      sendEmail(to: "x@test.com", subject: "Hi", body: "Hello") {
        used
        email {
          subject
          folder
        }
      }
    }
    """

    client.force_login(user)
    res = client.post("/graphql/", {"query": mutation})

    assert res.status_code == 200
    payload = res.json()["data"]["sendEmail"]

    assert payload["email"]["folder"] == "sent"
    assert Email.objects.count() == 1

import pytest
from emails.models import Email


@pytest.mark.django_db
def test_graphql_inbox_query(client, user):
    Email.objects.create(
        user=user,
        sender="x@test.com",
        recipient=user.email,
        subject="Inbox mail",
        body="Hello",
        folder="inbox",
    )

    query = """
    query {
      myEmails {
        subject
        folder
      }
    }
    """

    client.force_login(user)
    res = client.post("/graphql/", {"query": query})

    assert res.status_code == 200
    data = res.json()["data"]["myEmails"]
    assert len(data) == 1
    assert data[0]["folder"] == "inbox"

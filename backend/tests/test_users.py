import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
def test_user_me():
    user = User.objects.create_user("john", "j@j.com", "pass")
    client = APIClient()

    token = client.post("/auth/token/", {"username": "john", "password": "pass"}).data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    res = client.get("/users/me/")
    assert res.status_code == 200
    assert res.data["username"] == "john"

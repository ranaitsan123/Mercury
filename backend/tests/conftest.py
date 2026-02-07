import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
@pytest.mark.django_db
def user():
    return User.objects.create_user(
        username="testuser",
        email="test@test.com",
        password="password"
    )


@pytest.fixture
@pytest.mark.django_db
def auth_client(user):
    client = APIClient()
    res = client.post("/auth/token/", {
        "username": user.username,
        "password": "password"
    })
    token = res.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
    return client

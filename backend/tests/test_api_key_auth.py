import os
import pytest
import importlib
from django.test import RequestFactory
from django.http import JsonResponse

# Import your middleware (path based on your file structure)
import middleware.api_key_gate as api_key_module


def get_response(request):
    # Simulate scanner mock/real response
    return JsonResponse({"ok": True})


@pytest.fixture
def rf():
    return RequestFactory()


# -------------------------------
# VALID API KEY
# -------------------------------
def test_api_key_valid(monkeypatch, rf):
    monkeypatch.setenv("SCANNER_API_KEY", "secret123")

    # Reload module so middleware loads updated env var
    importlib.reload(api_key_module)

    middleware = api_key_module.ApiKeyGateMiddleware(get_response)

    request = rf.post("/scanner/scan/", HTTP_X_API_KEY="secret123")
    response = middleware(request)

    assert response.status_code == 200
    assert response.json() == {"ok": True}


# -------------------------------
# MISSING API KEY
# -------------------------------
def test_api_key_missing(monkeypatch, rf):
    monkeypatch.setenv("SCANNER_API_KEY", "secret123")
    importlib.reload(api_key_module)

    middleware = api_key_module.ApiKeyGateMiddleware(get_response)

    request = rf.post("/scanner/scan/")  # No header
    response = middleware(request)

    assert response.status_code == 401
    assert "error" in response.json()
    assert response.json()["error"] == "invalid or missing API key"


# -------------------------------
# INVALID API KEY
# -------------------------------
def test_api_key_invalid(monkeypatch, rf):
    monkeypatch.setenv("SCANNER_API_KEY", "secret123")
    importlib.reload(api_key_module)

    middleware = api_key_module.ApiKeyGateMiddleware(get_response)

    request = rf.post("/scanner/scan/", HTTP_X_API_KEY="WRONG-KEY")
    response = middleware(request)

    assert response.status_code == 401
    assert response.json()["error"] == "invalid or missing API key"


# -------------------------------
# API KEY ONLY REQUIRED FOR /scanner/scan/
# -------------------------------
def test_api_key_not_required_for_other_endpoints(monkeypatch, rf):
    monkeypatch.setenv("SCANNER_API_KEY", "secret123")
    importlib.reload(api_key_module)

    middleware = api_key_module.ApiKeyGateMiddleware(get_response)

    request = rf.get("/users/me/")  # A different endpoint
    response = middleware(request)

    # Should pass without key
    assert response.status_code == 200
    assert response.json() == {"ok": True}


# -------------------------------
# KEY IS READ FROM ENV AT INIT
# -------------------------------
def test_api_key_caching(monkeypatch, rf):
    monkeypatch.setenv("SCANNER_API_KEY", "initial")
    importlib.reload(api_key_module)

    middleware = api_key_module.ApiKeyGateMiddleware(get_response)

    # Change ENV after initialization (should not affect middleware)
    monkeypatch.setenv("SCANNER_API_KEY", "new-value")

    request = rf.post("/scanner/scan/", HTTP_X_API_KEY="initial")
    response = middleware(request)

    assert response.status_code == 200

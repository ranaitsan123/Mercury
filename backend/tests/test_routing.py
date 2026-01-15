import os
import importlib
import pytest
from django.test import RequestFactory
from middleware import intelligent_router as router

def get_response(request):
    return None

def test_router_mock_mode(monkeypatch):
    monkeypatch.setenv("USE_REAL_SERVICES", "false")
    importlib.reload(router)  # reload to pick up env var

    request = RequestFactory().get("/")
    mw = router.IntelligentServiceRouterMiddleware(get_response)
    mw(request)

    assert request.service_route["scanner"] == "mock"

def test_router_real_mode(monkeypatch):
    monkeypatch.setenv("USE_REAL_SERVICES", "true")
    importlib.reload(router)  # reload to pick up env var

    request = RequestFactory().get("/")
    mw = router.IntelligentServiceRouterMiddleware(get_response)
    mw(request)

    assert request.service_route["scanner"] == "real"

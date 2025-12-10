from django.test import RequestFactory
from middleware.intelligent_router import IntelligentServiceRouterMiddleware
import os

def get_response(request):
    return None

def test_router_mock_mode(monkeypatch):
    monkeypatch.setenv("USE_REAL_SERVICES", "false")

    request = RequestFactory().get("/")
    mw = IntelligentServiceRouterMiddleware(get_response)
    mw(request)

    assert request.service_route["scanner"] == "mock"

def test_router_real_mode(monkeypatch):
    monkeypatch.setenv("USE_REAL_SERVICES", "true")

    request = RequestFactory().get("/")
    mw = IntelligentServiceRouterMiddleware(get_response)
    mw(request)

    assert request.service_route["scanner"] == "real"

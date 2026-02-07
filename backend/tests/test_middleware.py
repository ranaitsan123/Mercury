import uuid
import pytest
from django.test import RequestFactory
from django.http import JsonResponse
from django.contrib.auth.models import AnonymousUser

from middleware.security_gateway import SecurityGatewayMiddleware
from middleware.intelligent_router import IntelligentServiceRouterMiddleware
from middleware.response_logger import ResponseLoggingMiddleware

def get_response(_):
    return JsonResponse({"ok": True})

def test_security_gateway_adds_trace_id():
    request = RequestFactory().get("/scanner/scan/")
    mw = SecurityGatewayMiddleware(get_response)

    response = mw(request)

    assert hasattr(request, "trace_id")
    assert isinstance(uuid.UUID(request.trace_id), uuid.UUID)

def test_router_sets_service_route():
    request = RequestFactory().post("/scanner/scan/")
    mw = IntelligentServiceRouterMiddleware(get_response)
    response = mw(request)

    assert hasattr(request, "service_route")
    assert "scanner" in request.service_route
    assert request.service_route["scanner"] in ["mock", "real"]

def test_response_logger_injects_trace():
    request = RequestFactory().get("/")
    request.trace_id = "1234-TEST"
    request.user = AnonymousUser()  # FIX

    mw = ResponseLoggingMiddleware(get_response)
    response = mw(request)

    assert "trace_id" in response.json()

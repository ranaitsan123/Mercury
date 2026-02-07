import logging
import time

logger = logging.getLogger("gateway_logger")


class ResponseLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration_ms = round((time.time() - start) * 1000, 2)

        user = getattr(request, "user", None)

        logger.info(
            "request_completed",
            extra={
                "trace_id": getattr(request, "trace_id", None),
                "user": user.username if user and user.is_authenticated else "anon",
                "role": getattr(user, "role", None) if user else None,
                "path": request.path,
                "method": request.method,
                "status": response.status_code,
                "services": getattr(request, "service_route", {}),
                "duration_ms": duration_ms,
            },
        )

        return response

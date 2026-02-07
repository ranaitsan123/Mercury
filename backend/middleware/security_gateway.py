import uuid
import time
from django.http import JsonResponse

class SecurityGatewayMiddleware:
    """
    - Enforces role-based access
    - Creates request.trace_id
    - Simple IP-based rate limiting (in-memory)
    """

    RATE_LIMIT = {}  # simple in-memory (good for dev)
    MAX_REQUESTS = 60  # per minute
    WINDOW = 60

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1) Trace ID for distributed logging
        request.trace_id = uuid.uuid4().hex

        # 2) Basic rate limiting (per IP)
        ip = request.META.get("REMOTE_ADDR", "unknown")
        now = time.time()

        if ip not in self.RATE_LIMIT:
            self.RATE_LIMIT[ip] = []

        self.RATE_LIMIT[ip] = [
            ts for ts in self.RATE_LIMIT[ip] if now - ts < self.WINDOW
        ]

        if len(self.RATE_LIMIT[ip]) >= self.MAX_REQUESTS:
            return JsonResponse(
                {"error": "rate limit exceeded", "trace_id": request.trace_id},
                status=429
            )

        self.RATE_LIMIT[ip].append(now)

        # 3) Role enforcement
        required_role = getattr(request, "required_role", None)

        if required_role:
            if not request.user.is_authenticated or request.user.role != required_role:
                return JsonResponse({"error": "forbidden", "trace_id": request.trace_id}, status=403)

        return self.get_response(request)

import os
from django.http import JsonResponse

class ApiKeyGateMiddleware:
    """
    Protects specific endpoints (e.g., /scanner/scan/) using X-API-KEY.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.valid_key = os.getenv("MAILSERVER_API_KEY")

    def __call__(self, request):
        # Only protect scanner API
        if request.path.startswith("/scanner/scan/"):
            
            provided = request.headers.get("X-API-KEY")

            if not provided or provided != self.valid_key:
                return JsonResponse(
                    {"error": "invalid or missing API key"},
                    status=401
                )

        return self.get_response(request)

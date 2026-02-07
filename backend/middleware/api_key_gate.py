import os
from django.http import JsonResponse

class ApiKeyGateMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.valid_key = os.getenv("SCANNER_API_KEY")  # RENAMED

    def __call__(self, request):
        if request.path.startswith("/scanner/scan/"):
            provided = request.headers.get("X-API-KEY")
            if not provided or provided != self.valid_key:
                return JsonResponse({"error": "invalid or missing API key"}, status=401)

        return self.get_response(request)

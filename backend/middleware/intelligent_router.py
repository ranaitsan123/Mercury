import time
import requests
import os

class IntelligentServiceRouterMiddleware:
    """
    Automatically selects mock vs real services for:
        - mail server
        - AI scanner
    Keeps short-term memory of service health.
    """

    def __init__(self, get_response):
        self.get_response = get_response

        # read env
        self.real_mail_url = os.getenv("REAL_MAILSERVER_URL")
        self.real_scan_url = os.getenv("REAL_AISCANNER_URL")
        self.use_real = os.getenv("USE_REAL_SERVICES", "auto").lower()

        # health memory
        self.service_status = {
            "mail": True,
            "scanner": True,
        }
        self.last_checked = { "mail": 0, "scanner": 0 }
        self.check_interval = 10  # seconds

    def check_service(self, kind, url):
        now = time.time()
        if now - self.last_checked[kind] < self.check_interval:
            return self.service_status[kind]

        self.last_checked[kind] = now

        try:
            # Prefer HEAD request
            requests.head(url, timeout=1, allow_redirects=True)
        except Exception:
            # Fallback to GET if HEAD fails
            try:
                requests.get(url, timeout=1)
            except Exception:
                self.service_status[kind] = False
                return False

        return self.service_status[kind]

    def __call__(self, request):
        """
        Decide the routing dynamically for this request.
        """

        # MAIL SERVER ROUTING
        mail_ok = self.check_service("mail", self.real_mail_url) if self.real_mail_url else False
        scanner_ok = self.check_service("scanner", self.real_scan_url) if self.real_scan_url else False

        def decide(kind, ok_flag):
            if self.use_real == "true":
                return "real" if ok_flag else "mock"
            if self.use_real == "false":
                return "mock"
            return "real" if ok_flag else "mock"

        request.service_route = {
            "mailserver": decide("mail", mail_ok),
            "scanner": decide("scanner", scanner_ok),
        }

        return self.get_response(request)

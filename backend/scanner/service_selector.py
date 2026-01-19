import os
import requests
import logging
from emails.mock_service import mock_service

logger = logging.getLogger(__name__)

MAILSERVER_URL = os.getenv("REAL_MAILSERVER_URL")
SCANNER_URL = os.getenv("REAL_AISCANNER_URL")
API_KEY = os.getenv("SCANNER_API_KEY")
USE_REAL = os.getenv("USE_REAL_SERVICES", "false").lower() == "true"


def try_real_send_email(data):
    if not USE_REAL:
        return mock_service.send_email(**data)

    try:
        response = requests.post(MAILSERVER_URL, json=data, timeout=3)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Mail server error: {e}")
        return mock_service.send_email(**data)


def try_real_scan(content):
    """
    content = {
        "subject": str,
        "body": str
    }
    """
    if not USE_REAL:
        return mock_service.scan_email(content["body"])

    try:
        response = requests.post(
            SCANNER_URL,
            json=content,
            headers={"X-API-KEY": API_KEY},
            timeout=3,
        )
        response.raise_for_status()
        return response.json()

    except Exception as e:
        logger.error(f"Scanner error: {e}")
        return mock_service.scan_email(content["body"])

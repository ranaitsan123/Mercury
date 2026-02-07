import os
import requests
import logging
from emails.mock_service import mock_service

logger = logging.getLogger(__name__)

MAILSERVER_URL = os.getenv("REAL_MAILSERVER_URL")
SCANNER_URL = os.getenv("REAL_AISCANNER_URL")
API_KEY = os.getenv("SCANNER_API_KEY")

MODE = os.getenv("USE_REAL_SERVICES", "false").lower()
USE_REAL = MODE in ("true", "auto")

def try_real_send_email(data):
    if not USE_REAL:
        logger.warning("🟡 Using MOCK mail sender")
        return mock_service.send_email(**data)

    try:
        logger.info("🟢 Using REAL mail server")
        response = requests.post(MAILSERVER_URL, json=data, timeout=3)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"🔴 Mail server error, using MOCK sender: {e}")
        return mock_service.send_email(**data)

def try_real_scan(content):
    """
    content = {
        "subject": str,
        "body": str
    }
    """
    if not USE_REAL:
        logger.warning("🟡 Falling back to MOCK scanner (USE_REAL is False)")
        return mock_service.scan_email(content["body"])

    try:
        logger.info("🟢 Using REAL ML scanner")
        response = requests.post(
            SCANNER_URL,
            json=content,
            headers={"X-API-KEY": API_KEY},
            timeout=3,
        )
        response.raise_for_status()
        return response.json()

    except Exception as e:
        logger.error(f"🔴 Scanner error, falling back to MOCK scanner: {e}")
        return mock_service.scan_email(content["body"])

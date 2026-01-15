import os
import requests
from emails.mock_service import mock_service

import logging
logger = logging.getLogger(__name__)

MAILSERVER_URL = os.getenv("REAL_MAILSERVER_URL")
SCANNER_URL = os.getenv("REAL_AISCANNER_URL")
USE_REAL = os.getenv("USE_REAL_SERVICES", "false").lower() == "true"


def try_real_send_email(data):
        if not USE_REAL:
                logger.warning("Real email service disabled. Using mock.")
                return mock_service.send_email(**data)

        try:
                logger.info(f"Trying real mail server at {MAILSERVER_URL}")
                response = requests.post(MAILSERVER_URL, json=data, timeout=3)
                response.raise_for_status()
                return response.json()

        except Exception as e:
                logger.error(f"Real mail server DOWN: {e}. Falling back to mock.")
                return mock_service.send_email(**data)


def try_real_scan(body):
        if not USE_REAL:
                logger.warning("Real AI scanner disabled. Using mock.")
                return mock_service.scan_email(body)

        try:
                logger.info(f"Trying real scanner at {SCANNER_URL}")
                response = requests.post(SCANNER_URL, json={"body": body}, timeout=3)
                response.raise_for_status()
                return response.json()

        except Exception as e:
                logger.error(f"AI scanner DOWN: {e}. Falling back to mock.")
                return mock_service.scan_email(body)

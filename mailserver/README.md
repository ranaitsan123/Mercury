# Mail Server Mock

This directory simulates the **email ingestion service** for Mercury.

Its role is to:
- Receive incoming email events
- Forward them to the Mercury API
- Provide mock email data for testing

## Tech stack
- Python (Flask) or Node.js
- Simple REST endpoint `/fetch_email`

Example request from API:
```json
{
  "email_id": "12345"
}
````

Example response:

```json
{
  "sender": "user@example.com",
  "recipient": "admin@mercury.io",
  "subject": "Security alert",
  "body": "Possible phishing attempt detected.",
  "attachments": []
}
```

## Run inside Docker

```bash
docker-compose up mailserver
```

The mock service runs at **[http://localhost:8080/fetch_email](http://localhost:8080/fetch_email)**.

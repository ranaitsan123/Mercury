# AI Scanner Service

This directory hosts the **AI email analysis service**.

It analyzes the text of each email to determine whether it's
**safe**, **suspicious**, or **malicious**, and returns a confidence score.

## Tech stack
- Python 3
- Flask or FastAPI (REST microservice)
- Machine learning or rule-based model (to be added)

## API example
POST `/scan`
```json
{
  "subject": "Invoice attached",
  "body": "Please find the invoice attached."
}
````

Response:

```json
{
  "result": "safe",
  "confidence": 0.93
}
```

## Run inside Docker

```bash
docker-compose up aiscanner
```

The service will listen on **[http://localhost:5000/scan](http://localhost:5000/scan)**.

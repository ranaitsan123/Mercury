# Mercury API

This directory contains the **main Django REST API** for the Mercury system.

## Features
- User management and authentication
- Email ingestion and storage
- AI scan result recording
- Swagger documentation (`/swagger/`)
- Exception handling and mock fallbacks for unavailable services

## Tech stack
- Django 5.x
- Django REST Framework
- drf-yasg (Swagger/OpenAPI docs)
- PostgreSQL (via Docker)
- Faker (mock data generation)

## Run inside Docker
```bash
docker-compose up api
````

The API will auto-create the Django project and app on first run,
apply migrations, and start at **[http://localhost:8000/](http://localhost:8000/)**.

Swagger UI: **[http://localhost:8000/swagger/](http://localhost:8000/swagger/)**

````

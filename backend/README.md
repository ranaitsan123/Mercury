# **✨ NEW README: Mercury Backend (Advanced Middleware Edition)**

**Documentation Version:** 2025-12-10
**Project:** Mercury Email Security Backend (Django + Intelligent Middleware)

---

# **Overview**

Mercury Backend is a **Django 5.2-based REST API** that provides:

* User authentication & roles
* Email scanning (mock or real AI scanner)
* Email sending (mock or real mail server)
* Automatic service routing
* Logging & monitoring
* A fully dockerized microservice-style email gateway

This backend now includes an **Advanced 3-Layer Middleware System** that adds intelligence, routing, tracing, and auto-fallback behavior for real vs mock services.

---

# **🚀 New Architecture Enhancements (2025-12)**

Mercury Backend now implements:

### ✅ **1. Security Gateway Middleware**

Adds:

* role enforcement
* request rate limiting (basic)
* request `trace_id`
* security logging

### ✅ **2. Intelligent Service Router Middleware**

The core upgrade.
This middleware decides **per-request** whether to use:

| Service     | Mode        |
| ----------- | ----------- |
| Mail server | real / mock |
| AI scanner  | real / mock |

Routing is based on:

* environment variable `USE_REAL_SERVICES`
* service health status
* automatic fallback when real service fails

It attaches:

```python
request.service_route = {
  "mailserver": "real" or "mock",
  "scanner": "real" or "mock"
}
```

### ✅ **3. Response Logging Middleware**

Adds:

* response tracing
* service usage logging
* transparent monitoring

---

# **🌐 Updated System Architecture**

```
 +---------------------+
 |      Frontend       |
 +----------+----------+
            |
            v  (HTTP + JWT)
 +-----------------------------+
 | Mercury Backend (Django)    |
 | - Security Gateway          |
 | - Intelligent Router        |
 | - Response Logger           |
 +-------------+---------------+
               |
        +------+-------+
        |              |
        v              v
+---------------+   +----------------+
| Real Services |   | Mock Services  |
| (optional)    |   | (development)  |
+---------------+   +----------------+
        |                    |
        v                    v
   Mail Server         Fake Mail Sender
   AI Scanner          Randomized Scanner
```

The backend **switches automatically** between real and mock services.

---

# **Environment Variables**

```
USE_REAL_SERVICES=auto   # auto | true | false

REAL_MAILSERVER_URL=http://mailserver:8080/send
REAL_AISCANNER_URL=http://aiscanner:5000/scan

POSTGRES_DB=backend_db
POSTGRES_USER=django
POSTGRES_PASSWORD=django123
POSTGRES_HOST=db
POSTGRES_PORT=5432

DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=admin123
DJANGO_SUPERUSER_EMAIL=admin@example.com
```

### ✔ `"auto"` = recommended

The middleware chooses automatically based on health + availability.

---

# **API Endpoints & Data Contracts**

## **1. Email Scanning (Intelligent Routing)**

**POST `/scanner/scan/`**
**Auth:** Required

### Request

```json
{
  "from": "user@example.com",
  "subject": "Test",
  "body": "Email content"
}
```

### Response

```json
{
  "id": 123,
  "result": "safe",
  "confidence": 0.87,
  "used": "real",      // real or mock
  "trace_id": "f9c1..."
}
```

---

## **2. Send Email (Intelligent Routing)**

**POST `/emails/send/`**
**Auth:** Required

### Request

```json
{
  "to": "recipient@example.com",
  "subject": "Hello",
  "body": "Testing send"
}
```

### Response

```json
{
  "id": 4567,
  "status": "sent_mock",
  "used": "mock",
  "trace_id": "a81b..."
}
```

---

## **3. Scan Logs**

**GET `/scanner/logs/`**

Shows the 200 most recent scan logs.

---

# **Users & Authentication**

* Custom `User` model
* Roles: `admin`, `user`
* JWT authentication (SimpleJWT)

### Auth Endpoints

* `POST /auth/token/`
* `POST /auth/token/refresh/`
* `GET /users/me/`

---

# **How the Intelligent Router Works**

### Step 1 — The middleware runs **before** any view

It decides:

```python
"mailserver": "real" or "mock"
"scanner": "real" or "mock"
```

### Step 2 — The view reads the route

```python
route = request.service_route["scanner"]
```

### Step 3 — The view executes the selected service

```python
if route == "real":
    result = try_real_scan(body)
else:
    result = mock_service.scan_email(body)
```

### Step 4 — Response Logger adds metadata

Every response includes a `trace_id`.

---

# **Why We Added the 3 Middleware Layers**

### ✔ Fault Tolerance

If real AI scanner fails → auto-switch to mock.

### ✔ Safe Development

Local developers always get mock services unless enabled.

### ✔ Clean Separation

Views no longer contain logic like:

* “should I call real?”
* “is service down?”
* “should I fallback?”

All of this is centralized.

### ✔ Production Observability

Every request now has:

* trace ID
* logged route choice
* consistent metadata

---

# **Benefits**

### ✅ Zero-downtime fallback

Real scanner can die — system keeps working.

### ✅ Same API for dev & production

Frontend never changes behavior.

### ✅ Clean view logic

Views stay “dumb”, middleware stays “smart”.

### ✅ Seamless transition to real infrastructure

When mail server or AI scanner are ready, just set:

```
USE_REAL_SERVICES=true
```

No code changes required.

---

# **Future Improvements**

### 📌 1. Health Check Loop

Add periodic heartbeat checks so middleware updates automatically.

### 📌 2. Distributed Tracing

Push trace IDs to Grafana/Jaeger.

### 📌 3. Logging Dashboard

Frontend page to view router activity + failovers.

### 📌 4. Role-Based Access Enforcement

Admin can restrict logs by user/team.

### 📌 5. Real Virus Scanner Integration

When ready, attach the real ML model.

---

# **🧪 Automated Tests**

Mercury Backend now includes a **comprehensive test suite** to ensure both functionality and middleware intelligence are working correctly. Tests cover:

### **1. Email Scanning Tests**

* Validate that **AI scanner routes correctly** (`real` vs `mock`).
* Check that scanning results include:

  * `result` (`safe` / `malicious`)
  * `confidence` score
  * `used` service (`real` or `mock`)
  * `trace_id`
* Confirm fallback behavior: if the real scanner fails, mock is automatically used.

### **2. Email Sending Tests**

* Validate intelligent routing to **real or mock mail servers**.
* Check that sending responses include:

  * `status` (`sent_real` / `sent_mock`)
  * `used` service
  * `trace_id`
* Confirm that views respect authentication and route selection.

### **3. Middleware & Routing Tests**

* Ensure `request.service_route` is correctly set before views.
* Confirm security middleware enforces authentication and role restrictions.
* Test automatic failover from real → mock services.

### **4. Scan Log Tests**

* Ensure logs are correctly stored and retrieved.
* Validate log fields like `id`, `result`, `used`, and `trace_id`.

---

## **Running Tests**

### 1. Run all tests

```bash
docker compose exec backend python manage.py test
```

### 2. Run tests for a specific app

```bash
docker compose exec backend python manage.py test scanner
```

### 3. Run tests with more verbose output

```bash
docker compose exec backend python manage.py test --verbosity=2
```

---

## **Example Test Snippet**

```python
from rest_framework.test import APITestCase
from django.urls import reverse

class ScanEmailTest(APITestCase):
    def test_scan_email_safe(self):
        url = reverse('scanner:scan')
        data = {"from": "user@example.com", "subject": "Hello", "body": "Test email"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn(response.data['result'], ["safe", "malicious"])
        self.assertIn(response.data['used'], ["real", "mock"])
        self.assertTrue('trace_id' in response.data)
```

---

### ✅ **Why These Tests Matter**

1. **Safety:** Ensures that real AI services are never called unexpectedly in development.
2. **Reliability:** Confirms automatic fallback to mock services.
3. **Traceability:** Guarantees every response includes a `trace_id`.
4. **Consistency:** Frontend sees the same API behavior regardless of real/mock services.

---

# **Getting Started**

### Docker Compose

```bash
docker-compose up --build
```

* Backend → `http://localhost:8000/`
* PostgreSQL → `localhost:5432`

Superuser created automatically using `.env`.

---

# **Versioning & Documentation Date**

* Documentation Version: **1.1**
* Updated: **2025-12-10**


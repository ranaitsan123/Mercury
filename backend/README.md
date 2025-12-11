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

# 🔐 **NEW: API Key Authentication Layer (Mailserver → Backend)**

### *Added 11th December 2025*

A new security layer was added to protect the `/scanner/scan/` endpoint when it is called by the **mailserver service**. This ensures that **only authorized internal services** (like the mailserver) can trigger a scan, preventing:

* unauthorized external access
* spam/flooding attacks
* script abuse
* expensive AI calls from untrusted sources

This is implemented using a custom middleware named:

```
ApiKeyGateMiddleware
```

---

# 🧩 **Why API Key Authentication Was Added**

### ✔ Mailserver is not a user → cannot use JWT

The mailserver is a backend service, not a human.
It has no:

* username/password
* login
* refresh tokens

So JWT is not appropriate.

### ✔ Services need a simpler authentication method

Service-to-service authentication uses **API keys**, not JWT.

This is standard in:

* Stripe webhooks
* GitHub webhooks
* Slack apps
* Twilio
* Google API calls

Your backend follows this same architecture.

### ✔ Protects high-cost AI scanning

The AI scanner endpoint must never be publicly accessible.

---

# 🛡 **How It Works**

### 1. Backend loads expected key from environment:

```
MAILSERVER_API_KEY=super_secret_key_123
```

### 2. Mailserver sends this header with each request:

```
X-API-KEY: super_secret_key_123
```

### 3. Middleware enforces the check:

```python
if request.path.startswith("/scanner/scan/"):
    provided = request.headers.get("X-API-KEY")
    if not provided or provided != self.valid_key:
        return JsonResponse({"error": "invalid or missing API key"}, status=401)
```

### 4. If the key is valid → request continues

### 5. If invalid/missing → request blocked (401 Unauthorized)

👑 **This ensures only your Mailserver can call the AI scanner endpoint.**

---

# 🌐 **Environment Variable Updates**

Your `.env` (located in the project root, not inside backend) now includes:

```
MAILSERVER_API_KEY=super_secret_key_123
```

⚠ **Note:**
pytest does *not* automatically load `.env`, so tests use `monkeypatch.setenv()` to inject the key manually.

---

# 🧪 **New Automated Tests: API Key Authentication**

A full test suite was added to validate the middleware behavior even when **mock services** are used.

### ✔ Valid key → request passes

### ✔ Missing key → request blocked

### ✔ Wrong key → request blocked

### ✔ Only `/scanner/scan/` is protected

### ✔ Middleware loads the key once (cached behavior)

### Example test:

```python
request = rf.post("/scanner/scan/", HTTP_X_API_KEY="secret123")
response = middleware(request)
assert response.status_code == 200
```

### Invalid key:

```python
request = rf.post("/scanner/scan/", HTTP_X_API_KEY="WRONG")
response = middleware(request)
assert response.status_code == 401
```

### Key not required for other endpoints:

```python
request = rf.get("/users/me/")
response = middleware(request)
assert response.status_code == 200
```

---

# 🔌 **Interaction with Intelligent Service Router**

The API Key middleware runs **before** the intelligent routing middleware:

```
[1] ApiKeyGateMiddleware  
[2] SecurityGatewayMiddleware  
[3] IntelligentServiceRouterMiddleware  
[4] Views  
```

This ordering ensures:

* No request reaches the router unless the key is valid.
* Real/Mock service routing still works normally.
* API key protection is independent from mock/real service selection.

---

# 🎁 **Benefits of Adding API Key Layer**

| Benefit              | Explanation                                            |
| -------------------- | ------------------------------------------------------ |
| 🔐 Security          | Protects AI scanning endpoint from unauthorized access |
| 🖧 Service identity  | Mailserver identifies itself cleanly                   |
| 🚫 Abuse prevention  | Blocks scripts, bots, and external requests            |
| ♻ Clean architecture | User auth = JWT, service auth = API key                |
| 🧪 Testable          | Fully testable without real services                   |
| 🧩 Works with router | Router behavior unchanged                              |

---

# ⚙️ **Combined Flow (Visual)**

```
Mailserver → (X-API-KEY) → ApiKeyGateMiddleware  
         → Intelligent Router → Real or Mock AI Scanner  
         → Response Logging → Trace ID → JSON Response
```

---

# **Versioning & Documentation Date**

* Documentation Version: **1.2**
* Updated: **2025-12-11**


# Mercury Backend Tests

This directory contains the **full test suite** for the Mercury backend system.
Tests cover **REST APIs**, **GraphQL**, **middleware**, **service routing**, **AI scanning**, **subscriptions**, and **authentication**.

---

## Test Structure

### 1. `conftest.py`

* Provides **fixtures** for reusable test components:

  * `user` — Creates a test user in the database.
  * `auth_client` — Returns an authenticated APIClient with JWT credentials.
* Ensures **all tests requiring authentication** can reuse a single fixture.
* Automatically handles **database access** with `@pytest.mark.django_db`.

---

### 2. `test_emails.py`

**Purpose:** Test email sending functionality.

**Key Tests:**

* `test_mock_send_email()`

  * Sends a mock email.
  * Checks that the response contains `status: "sent_mock"`.
  * Verifies the `Email` object is stored in the database with `folder="sent"` and `is_outgoing=True`.

**Requirements:**

* Authenticated user via `auth_client`.
* Mock email service endpoint `/emails/mock/send/`.

---

### 3. `test_scanner.py`

**Purpose:** Test the AI scanner API.

**Key Tests:**

* `test_scan_creates_log()`

  * Sends a scan request.
  * Verifies that a `ScanLog` record is created and linked to the correct user.
  * Ensures `result` is either `"safe"` or `"malicious"`.

**Database Behavior:**

* Each scan is automatically rolled back after test completion.

---

### 4. `test_users.py`

**Purpose:** Test user authentication and profile endpoints.

**Key Tests:**

* `test_user_me()`

  * Logs in a test user.
  * Retrieves `/users/me/`.
  * Confirms the correct username is returned.

**Key Endpoints:**

* `POST /auth/token/` — Obtains JWT access token.
* `GET /users/me/` — Retrieves user profile.

---

### 5. `test_middleware.py`

**Purpose:** Test custom middleware.

**Key Tests:**

* `test_security_gateway_adds_trace_id()`

  * Ensures every request receives a unique `trace_id`.
* `test_router_sets_service_route()`

  * Confirms intelligent service routing for mock/real services.
* `test_response_logger_injects_trace()`

  * Validates that `trace_id` is injected into response JSON.

**Middleware Components:**

* `SecurityGatewayMiddleware` — Adds trace IDs.
* `IntelligentServiceRouterMiddleware` — Routes requests to mock/real services.
* `ResponseLoggingMiddleware` — Logs responses with trace ID.

---

### 6. `test_routing.py`

**Purpose:** Test intelligent service routing based on environment variables.

**Key Tests:**

* `test_router_mock_mode()` — Ensures routing goes to **mock services** if `USE_REAL_SERVICES=false`.
* `test_router_real_mode()` — Ensures routing goes to **real services** if `USE_REAL_SERVICES=true`.

**Environment Variables:**

* `USE_REAL_SERVICES` (`"true"`, `"false"`, `"auto"`).

---

### 7. GraphQL Tests

#### a) `test_graphql_emails.py`

* Tests **inbox query**.
* Confirms that `myEmails` query returns only the authenticated user's emails.
* Checks fields like `subject` and `folder`.

#### b) `test_graphql_send_email.py`

* Tests **sendEmail mutation**.
* Confirms that a sent email is saved correctly in the database (`folder="sent"`, `is_outgoing=True`).
* Checks that `used` field reflects the service route (`mock` or `real`).

---

### 8. Subscription Tests

#### a) `test_subscriptions.py`

* Tests **event publication** for `email_created`.
* Confirms signals are wired and Redis/GraphQL subscriptions can consume events.
* Does **not** require WebSocket or frontend clients.

---

## Running the Tests

### Run all tests:

```bash
pytest
```

### Run a specific test file:

```bash
pytest tests/test_emails.py
```

### Run a specific test function:

```bash
pytest tests/test_scanner.py::test_scan_creates_log
```

### Run with verbose output:

```bash
pytest -v
```

### Run with coverage report:

```bash
pytest --cov=.
```

### Run with Django database:

```bash
pytest --ds=backend.settings
```

---

## Test Guidelines

1. **Always use fixtures** (`auth_client`, `user`) for authentication.
2. **Mark database tests** with `@pytest.mark.django_db`.
3. **Keep tests isolated** — one test per functionality.
4. **Mock services** for emails and AI scanning whenever possible.
5. **GraphQL subscriptions** are tested at the event layer, not via WebSockets.

---

## Test Coverage Overview

| Test Suite     | Coverage                         |
| -------------- | -------------------------------- |
| REST Endpoints | Email, Scanner, Users            |
| Middleware     | Trace IDs, Routing, Logging      |
| Routing        | Mock/Real services               |
| GraphQL        | Inbox, SendEmail mutation        |
| Subscriptions  | Event publishing (email_created) |

---

## Notes

* All tests **rollback database changes automatically**.
* Environment variables like `USE_REAL_SERVICES` control routing during tests.
* GraphQL subscriptions require `graphene_subscriptions` and Redis configured.
* WebSocket frontend testing is **not included** in this backend suite.

---

This README is now **fully aligned** with your current backend tests, including **REST, GraphQL, middleware, routing, and subscriptions**.

---

## Test Coverage Diagram

```
              ┌───────────────────┐
              │   REST Endpoints  │
              │ (Emails, Scanner, │
              │  Users API)       │
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │   GraphQL API     │
              │ (Queries, Mutations│
              │  Inbox, SendEmail)│
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Subscriptions /   │
              │ Event Layer       │
              │ (email_created,   │
              │  scan_completed)  │
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Database Models   │
              │ (Email, ScanLog)  │
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │  Middleware       │
              │ (Security, Router,│
              │  Logging, API Key)│
              └───────────────────┘
```

---

### Explanation

1. **REST Endpoints**

   * Test sending emails, scanning emails, and user endpoints.
   * Uses `APIClient` for HTTP requests.
   * Tests verify responses and database side effects.

2. **GraphQL API**

   * Tests inbox queries, `SendEmail` mutation, and permissions.
   * Uses `graphene` test client or APIClient with GraphQL POST payloads.

3. **Subscriptions / Event Layer**

   * Tests that signals/events are emitted (e.g., `email_created`, `scan_completed`).
   * Confirms that Redis/GraphQL subscription system receives events.

4. **Database Models**

   * Core tests validate `Email` and `ScanLog` creation and correctness.
   * Rollback after each test to maintain isolation.

5. **Middleware**

   * Tests ensure:

     * Trace IDs are generated (`SecurityGatewayMiddleware`)
     * Requests are routed to correct service (`IntelligentServiceRouterMiddleware`)
     * Responses log the trace (`ResponseLoggingMiddleware`)
     * API key enforcement (`ApiKeyGateMiddleware`)

---

✅ **Key Idea:**
All tests flow **from API → GraphQL → Events → DB → Middleware**, ensuring full-stack coverage while keeping each layer testable in isolation.

---

# 📘 Frontend Integration Documentation

**Project:** Mock Email & Scanner Backend
**Backend Stack:** Django + Graphene (GraphQL) + JWT
**API Style:** REST + GraphQL (primary)

---

## 1️⃣ Backend Overview (for frontend)

Your backend exposes:

| API Type | Purpose                                         |
| -------- | ----------------------------------------------- |
| REST     | Authentication, admin, legacy                   |
| GraphQL  | **Main data access** (emails, scans, mutations) |

Frontend **should use GraphQL** for:

* Fetching emails
* Sending emails
* Fetching scan results
* Authenticated user data

---

## 2️⃣ API Endpoints

### 🔐 Authentication (REST – JWT)

Frontend **must authenticate first**.

#### Obtain token

```
POST /auth/token/
```

**Payload**

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response**

```json
{
  "access": "JWT_ACCESS_TOKEN",
  "refresh": "JWT_REFRESH_TOKEN"
}
```

---

#### Refresh token

```
POST /auth/token/refresh/
```

---

### 🧠 GraphQL Endpoint

```
POST /graphql/
```

or (dev only)

```
GET /graphql/  (GraphiQL enabled)
```

---

## 3️⃣ Authentication for GraphQL

Frontend **must send JWT** in headers:

```
Authorization: Bearer <ACCESS_TOKEN>
```

⚠️ If missing → `Authentication required`

---

## 4️⃣ GraphQL Schema Access

GraphQL is **self-documented**.

Frontend can explore:

* GraphiQL UI at `/graphql/`
* Introspection via Apollo / Relay

---

## 5️⃣ GraphQL Queries (READ)

---

### 📩 Get My Emails

```graphql
query MyEmails {
  myEmails(folder: "inbox", limit: 20, offset: 0) {
    id
    sender
    recipient
    subject
    body
    folder
    createdAt
  }
}
```

📌 Folders:

* `inbox`
* `sent`

---

### 🧪 Get My Scan Logs

```graphql
query MyScanLogs {
  myScanLogs(limit: 20, offset: 0) {
    id
    result
    confidence
    createdAt
    email {
      subject
    }
  }
}
```

---

### 🔐 Admin Only: All Scan Logs

```graphql
query AllScanLogs {
  scanLogs(result: "clean") {
    id
    result
    confidence
    createdAt
  }
}
```

❌ Non-admin → error

---

## 6️⃣ GraphQL Mutations (WRITE)

---

### ✉️ Send Email

```graphql
mutation SendEmail {
  sendEmail(
    to: "test@example.com"
    subject: "Hello"
    body: "This is a test"
  ) {
    used
    email {
      id
      subject
      recipient
      createdAt
    }
  }
}
```

**`used` value**

* `"mock"` → mock service
* `"real"` → real mail server

---

## 7️⃣ Authorization Rules

| Action        | Requirement    |
| ------------- | -------------- |
| Read emails   | Authenticated  |
| Send email    | Authenticated  |
| Scan logs     | Authenticated  |
| All scan logs | **Admin only** |

---

## 8️⃣ Errors Frontend Should Handle

### Authentication error

```json
{
  "errors": [
    { "message": "Authentication required" }
  ]
}
```

---

### Permission error

```json
{
  "errors": [
    { "message": "Admins only" }
  ]
}
```

---

### Query limit exceeded

```json
{
  "errors": [
    { "message": "Query limit exceeded: max 50 items allowed" }
  ]
}
```

---

## 9️⃣ Pagination Rules

GraphQL uses:

* `limit`
* `offset`

Frontend **must paginate**, max:

```
limit ≤ 50
```

---

## 🔍 Observability (for debugging)

Every request has:

* `trace_id`
* Shared between REST + GraphQL
* Appears in logs & audit tables

Frontend **does not need to send trace_id**
Backend generates it automatically.

---

## 1️⃣0️⃣ CORS & Frontend Hosting

Backend supports:

* Browser-based GraphQL
* Token auth
* SPA integration (React / Vue / Next)

Frontend just needs:

```
Authorization header
```

---

## 1️⃣1️⃣ Recommended Frontend Stack

Works perfectly with:

* Apollo Client
* Relay
* urql
* fetch / axios

---

## 1️⃣2️⃣ Summary for Frontend Dev 👇

> ✅ Use `/auth/token/` to login

> ✅ Store JWT access token

> ✅ Call `/graphql/` with Authorization header

> ✅ Use queries/mutations above

> ✅ Paginate results

> ❌ Do not call DB directly

> ❌ Do not bypass GraphQL


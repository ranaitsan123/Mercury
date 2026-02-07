# 📘 Frontend Integration Documentation

## Secure Email & Scanner Backend

**Backend Stack:** Django · GraphQL (Graphene) · JWT
**API Style:** REST (Authentication) + GraphQL (Business Logic)

---

## 1️⃣ Architecture Overview

The backend exposes **two interfaces**:

| Interface   | Purpose                        |
| ----------- | ------------------------------ |
| **REST**    | Authentication (JWT only)      |
| **GraphQL** | All application data & actions |

📌 **Frontend must use GraphQL for everything except authentication.**

---

## 2️⃣ Authentication (REST – JWT)

Authentication is handled via REST and is **required before any GraphQL call**.

### 🔐 Obtain Access Token

```
POST /auth/token/
```

**Request Body**

```json
{
  "username": "user",
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

### 🔄 Refresh Token

```
POST /auth/token/refresh/
```

**Request Body**

```json
{
  "refresh": "JWT_REFRESH_TOKEN"
}
```

---

## 3️⃣ GraphQL Endpoint

```
POST /graphql/
```

Development only:

```
GET /graphql/   (GraphiQL UI)
```

---

## 4️⃣ Authentication for GraphQL

All GraphQL requests **must include**:

```
Authorization: Bearer <ACCESS_TOKEN>
```

❌ Missing token → `Authentication required`

---

## 5️⃣ Core Backend Guarantee (VERY IMPORTANT)

> 🔐 **Every email created or returned by GraphQL is scanned automatically.**

This means:

* Frontend **never triggers scanning**
* Frontend **never waits for scan**
* Scan results are **always present**

There is **no email without a scan result**.

---

## 6️⃣ Core Concepts (Frontend View)

### 📧 Email

A message entity stored in the backend.

### 🧪 Scan

A security verdict attached to each email.

### 📂 Folder

| Value   | Meaning         |
| ------- | --------------- |
| `inbox` | Received emails |
| `sent`  | Sent emails     |

---

## 7️⃣ GraphQL Queries (READ)

### 📩 Get My Emails

```graphql
query MyEmails($folder: String!, $limit: Int!, $offset: Int!) {
  myEmails(folder: $folder, limit: $limit, offset: $offset) {
    id
    sender
    recipient
    subject
    body
    createdAt
    scan {
      result
      confidence
      createdAt
    }
  }
}
```

**Variables**

```json
{
  "folder": "inbox",
  "limit": 20,
  "offset": 0
}
```

📌 `folder` values:

* `inbox`
* `sent`

---

## 8️⃣ GraphQL Mutations (WRITE)

### ✉️ Send Email

```graphql
mutation SendEmail($to: String!, $subject: String!, $body: String!) {
  sendEmail(to: $to, subject: $subject, body: $body) {
    email {
      id
      sender
      recipient
      subject
      body
      createdAt
      scan {
        result
        confidence
      }
    }
  }
}
```

**Variables**

```json
{
  "to": "test@example.com",
  "subject": "Hello",
  "body": "This is a test email"
}
```

### ✅ Backend guarantees on success:

* Email is stored
* Email is scanned
* Scan result is stored
* Email + scan are returned together

---

## 9️⃣ Scan Result Values

### `scan.result`

| Value       | Meaning                   |
| ----------- | ------------------------- |
| `safe`      | No threat detected        |
| `malicious` | Potential threat detected |

### `scan.confidence`

* Float between `0.0` and `1.0`
* Higher means higher confidence

---

## 🔟 Authorization Rules

| Action            | Requirement        |
| ----------------- | ------------------ |
| Read emails       | Authenticated user |
| Send email        | Authenticated user |
| Admin scan access | Admin only         |

Frontend does **not** need to check roles unless UI requires it.

---

## 1️⃣1️⃣ Error Handling

### 🔐 Authentication Error

```json
{
  "errors": [
    { "message": "Authentication required" }
  ]
}
```

➡ Redirect to login

---

### ⛔ Permission Error

```json
{
  "errors": [
    { "message": "Permission denied" }
  ]
}
```

➡ Show access denied

---

### 📉 Pagination Error

```json
{
  "errors": [
    { "message": "Query limit exceeded" }
  ]
}
```

➡ Reduce `limit`

---

## 1️⃣2️⃣ Pagination Rules

GraphQL uses:

* `limit`
* `offset`

📌 Constraints:

```
limit ≤ 50
```

Frontend **must paginate**.

---

## 1️⃣3️⃣ What Frontend MUST NOT Do

❌ Call scanner REST endpoints
❌ Call email mock endpoints
❌ Send unscanned emails
❌ Bypass GraphQL

All business logic lives in GraphQL.

---

## 1️⃣4️⃣ Observability & Debugging

* Backend generates `trace_id`
* Shared across REST & GraphQL
* Appears in logs and audit tables

Frontend **does not send or manage** `trace_id`.

---

## 1️⃣5️⃣ Compatible Frontend Stacks

Fully compatible with:

* Apollo Client
* Relay
* urql
* fetch / axios

---

## 1️⃣6️⃣ TL;DR for Frontend Developer

✅ Login via `/auth/token/`
✅ Store JWT access token
✅ Call `/graphql/` with Authorization header
✅ Use `myEmails` to read
✅ Use `sendEmail` to write
✅ Always display scan results

❌ Never call scanner or mock endpoints

---

## ✅ Final Note

This contract is **stable and future-proof**.
Backend may later add:

* real mail delivery
* async processing
* subscriptions

Frontend **will not need changes**.


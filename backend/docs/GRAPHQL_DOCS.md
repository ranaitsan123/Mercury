# Mercury Backend GraphQL Documentation

## Overview

The Mercury backend exposes a **GraphQL API** for managing emails, inboxes, and AI scan logs. All frontend operations—sending emails, fetching inbox messages, scanning emails—are performed via GraphQL. REST endpoints exist only for internal integration or testing purposes.

**Core Components:**

| Component       | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `EmailType`     | Represents an email, with sender, recipient, folder, and linked scan log |
| `ScanLogType`   | Represents the AI scan results of an email or free-text input            |
| `Queries`       | Retrieve emails, inbox messages, scan logs                               |
| `Mutations`     | Send emails, scan text/emails                                            |
| `Subscriptions` | Real-time notifications for new emails or completed scans                |

---

## Authentication

All queries and mutations **require JWT authentication**, except system-level public queries (none currently exposed).
Add the `Authorization` header in this format:

```
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

## Queries

### 1. `myEmails`

Fetch the current user’s emails.

**Arguments:**

| Argument | Type   | Default   | Description                               |
| -------- | ------ | --------- | ----------------------------------------- |
| `folder` | String | `"inbox"` | Which folder to fetch (`inbox` or `sent`) |
| `limit`  | Int    | `50`      | Maximum number of emails returned         |
| `offset` | Int    | `0`       | Pagination offset                         |

**Example Query:**

```graphql
query {
  myEmails(folder: "inbox", limit: 10, offset: 0) {
    id
    sender
    recipient
    subject
    body
    folder
    createdAt
    scan {
      result
      confidence
    }
  }
}
```

---

### 2. `myScanLogs`

Fetch scan logs for the current user.

**Arguments:**

| Argument | Type | Default | Description                 |
| -------- | ---- | ------- | --------------------------- |
| `limit`  | Int  | `50`    | Maximum number of scan logs |
| `offset` | Int  | `0`     | Pagination offset           |

**Example Query:**

```graphql
query {
  myScanLogs(limit: 10) {
    id
    sender
    subject
    body
    result
    confidence
    scannedAt
  }
}
```

> Admin users can use `scanLogs(result: String, limit: Int, offset: Int)` to fetch all logs.

---

## Mutations

### 1. `SendEmail`

Send an email (mock or real based on service routing).

**Arguments:**

| Argument  | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| `to`      | String | Yes      | Recipient email |
| `subject` | String | Yes      | Email subject   |
| `body`    | String | Yes      | Email body      |

**Example Mutation:**

```graphql
mutation {
  sendEmail(to: "user@example.com", subject: "Hello", body: "Test message") {
    email {
      id
      sender
      recipient
      subject
      body
      folder
      createdAt
      scan {
        result
        confidence
      }
    }
    used
  }
}
```

**Response Fields:**

| Field   | Description                                            |
| ------- | ------------------------------------------------------ |
| `email` | The created Email object                               |
| `used`  | `"mock"` or `"real"` indicating which service was used |

---

### 2. `ScanEmail`

Scan arbitrary text (free-form or email body) using AI scanner.

**Arguments:**

| Argument  | Type   | Required | Description                     |
| --------- | ------ | -------- | ------------------------------- |
| `body`    | String | Yes      | Text to scan                    |
| `sender`  | String | No       | Email sender if scanning email  |
| `subject` | String | No       | Email subject if scanning email |

**Example Mutation:**

```graphql
mutation {
  scanEmail(body: "This is a test email body") {
    id
    result
    confidence
    used
  }
}
```

---

## Subscriptions

### 1. `emailCreated`

Triggered when a new email is created for the current user.

**Example Subscription:**

```graphql
subscription {
  emailCreated {
    id
    sender
    recipient
    subject
    body
    folder
    createdAt
    scan {
      result
      confidence
    }
  }
}
```

### 2. `scanCompleted`

Triggered when a new scan is completed.

```graphql
subscription {
  scanCompleted {
    id
    sender
    subject
    body
    result
    confidence
    scannedAt
  }
}
```

> Subscriptions require a WebSocket connection and Redis Pub/Sub backend.

---

## Notes on Service Routing

* The backend uses **middleware** to decide whether to use mock or real services.
* **Environment variable:** `USE_REAL_SERVICES`

  * `"true"` → real mail server / scanner
  * `"false"` → mock services
  * `"auto"` → intelligent routing based on system status

---

## Example Flow

1. User logs in → receives JWT token.
2. Frontend fetches inbox via `myEmails`.
3. User sends email → calls `sendEmail` mutation.
4. Backend creates `Email` record, triggers `scanEmail` signal.
5. Scan completes → `scanCompleted` subscription triggers frontend update.
6. Frontend shows updated scan results in real time.

---

# Mercury GraphQL Backend Workflow

```
           ┌─────────────┐
           │  Frontend   │
           │ (React/Vue) │
           └─────┬───────┘
                 │ GraphQL Request
                 │
   ┌─────────────▼─────────────┐
   │        GraphQL API         │
   │  Queries / Mutations /     │
   │  Subscriptions Resolver    │
   └─────┬───────────┬─────────┘
         │           │
         │           │
         │           │
┌────────▼───────┐   │
│   Email Queries│   │
│   myEmails()   │   │
└────────┬───────┘   │
         │           │
         ▼           │
    ┌─────────┐      │
    │ Email   │      │
    │ Model   │      │
    └─────────┘      │
         │           │
         │           │
         │           │
         │           │
         ▼           ▼
    ┌─────────┐   ┌─────────────┐
    │ScanLog  │   │SendEmail    │
    │Model    │   │Mutation     │
    └─────────┘   └─────┬───────┘
         ▲               │
         │               │ triggers Email creation
         │               ▼
         │         ┌─────────┐
         │         │Email    │
         │         │Model    │
         │         └─────────┘
         │               │
         │               ▼
         │         ┌────────────┐
         │         │ Signal:    │
         │         │ scan_email │
         │         └─────┬──────┘
         │               │
         │               ▼
         │         ┌─────────────┐
         │         │ ScanLog      │
         │         │ created      │
         │         └─────┬───────┘
         │               │ Publishes Event
         ▼               ▼
┌─────────────────┐   ┌─────────────────┐
│ scanCompleted    │   │ emailCreated     │
│ Subscription     │   │ Subscription     │
│ (WebSocket)      │   │ (WebSocket)      │
└─────────────────┘   └─────────────────┘
```

---

## How it Works Step-by-Step

1. **Frontend** sends a GraphQL query/mutation or subscribes to a subscription.
2. **GraphQL API resolvers** determine the action: fetch emails, create an email, or scan a body.
3. **Email creation** triggers a **Django signal (`scan_email`)** automatically.
4. **ScanLog model** is created after the scan finishes.
5. **Subscriptions** (`scanCompleted`, `emailCreated`) are published through Redis.
6. **Frontend receives updates in real-time** via WebSocket.

---

### Optional: Mermaid Diagram (Visual)

If you want to embed a **Mermaid diagram** directly in Markdown for nicer visualization:

```mermaid
flowchart TD
    Frontend -->|GraphQL request| GraphQLAPI
    GraphQLAPI -->|myEmails()| EmailModel
    GraphQLAPI -->|sendEmail()| EmailMutation
    EmailMutation -->|create Email| EmailModel
    EmailModel -->|signal scan_email| ScanLogModel
    ScanLogModel -->|publish| scanCompleted
    EmailModel -->|publish| emailCreated
    scanCompleted -->|WebSocket| Frontend
    emailCreated -->|WebSocket| Frontend
```

* ✅ Shows **queries → models**
* ✅ Shows **mutations → signals → subscriptions**
* ✅ Shows **real-time updates via Redis/WebSocket**

---

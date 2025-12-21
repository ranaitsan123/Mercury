# Mercury Frontend Architecture Documentation

## 1️⃣ GraphQL Client Setup

**Goal:** Connect the frontend to the backend GraphQL endpoint, including WebSocket support for subscriptions.

**Example stack:**

* `Apollo Client` (React or Vue) or `urql`
* `GraphQL-WS` for subscriptions

```javascript
import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

// HTTP for queries/mutations
const httpLink = new HttpLink({ uri: 'https://backend.example.com/graphql/' });

// WebSocket for subscriptions
const wsLink = new GraphQLWsLink(createClient({
  url: 'wss://backend.example.com/graphql/',
}));

// Split links: WS for subscriptions, HTTP for everything else
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

**Key Points:**

* Use **JWT tokens** for authentication.
* Include `Authorization: Bearer <token>` header in HTTP requests.
* Subscriptions automatically update the UI in real-time via WebSocket.

---

## 2️⃣ Folder Structure Suggestion

```
src/
├── api/
│   ├── graphql/
│   │   ├── queries.js       # e.g., myEmails, myScanLogs
│   │   ├── mutations.js    # e.g., sendEmail, scanEmail
│   │   └── subscriptions.js# e.g., scanCompleted, emailCreated
│   └── client.js           # ApolloClient instance
├── components/
│   ├── Inbox/
│   │   ├── InboxList.jsx
│   │   ├── EmailItem.jsx
│   │   └── EmailDetail.jsx
│   ├── Sent/
│   └── Scanner/
├── hooks/
│   └── useInbox.js         # Custom hook for fetching emails
├── context/
│   └── AuthContext.js      # JWT storage & auth state
└── pages/
```

---

## 3️⃣ Queries

**Inbox / Emails**

```graphql
query GetMyEmails($folder: String!, $limit: Int, $offset: Int) {
  myEmails(folder: $folder, limit: $limit, offset: $offset) {
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

**Frontend Notes:**

* Use **pagination** (`limit` and `offset`) for large inboxes.
* Map the `scan` object to display scan results on the email detail view.

---

## 4️⃣ Mutations

**Send Email**

```graphql
mutation SendEmail($to: String!, $subject: String!, $body: String!) {
  sendEmail(to: $to, subject: $subject, body: $body) {
    email {
      id
      sender
      recipient
      subject
      body
      folder
      createdAt
    }
    used
  }
}
```

**Scan Email**

```graphql
mutation ScanEmail($body: String!, $subject: String, $sender: String) {
  scanEmail(body: $body, subject: $subject, sender: $sender) {
    id
    result
    confidence
    used
  }
}
```

**Frontend Notes:**

* Mutations trigger **signals on the backend**, so the `scan` field in emails is updated automatically.
* After sending/scanning, update the Apollo cache to reflect new emails/logs.

---

## 5️⃣ Subscriptions (Real-Time Updates)

**New Email Received**

```graphql
subscription EmailCreated {
  emailCreated {
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

**Scan Completed**

```graphql
subscription ScanCompleted {
  scanCompleted {
    id
    user {
      id
      username
    }
    sender
    subject
    body
    result
    confidence
  }
}
```

**Frontend Notes:**

* Update the **inbox list or scan log list** automatically when a subscription event arrives.
* Optionally, show a **toast notification** or badge count for new emails/scans.

---

## 6️⃣ Recommended Hooks / State Management

**Example: useInbox.js**

```javascript
import { useQuery, useSubscription } from '@apollo/client';
import { MY_EMAILS_QUERY } from '../api/graphql/queries';
import { EMAIL_CREATED_SUBSCRIPTION } from '../api/graphql/subscriptions';

export default function useInbox(folder = "inbox") {
  const { data, loading, fetchMore } = useQuery(MY_EMAILS_QUERY, {
    variables: { folder, limit: 50, offset: 0 },
  });

  useSubscription(EMAIL_CREATED_SUBSCRIPTION, {
    onData: ({ client, data: subscriptionData }) => {
      // Add new email to cache
      const newEmail = subscriptionData.data.emailCreated;
      client.cache.modify({
        fields: {
          myEmails(existingEmails = []) {
            return [newEmail, ...existingEmails];
          },
        },
      });
    },
  });

  return { emails: data?.myEmails || [], loading, fetchMore };
}
```

---

## 7️⃣ Permissions Alignment

* **Frontend must enforce:** users can only see their own inbox (`myEmails`) and scan logs (`myScanLogs`).
* **Backend enforces authentication** with JWT via `login_required`.
* Do **not** attempt to fetch other users’ emails.

---

## 8️⃣ Summary

**Frontend should follow these principles:**

1. **GraphQL-first** – use queries, mutations, and subscriptions for all email and scan data.
2. **Use WebSocket subscriptions** to keep inbox and scanner logs live.
3. **Cache-aware updates** – integrate Apollo Client cache updates with mutations and subscriptions.
4. **State isolation** – separate inbox, sent, and scanner logs in hooks or stores.
5. **Pagination & filtering** – backend supports folder-based filtering and limits/offsets.
6. **JWT-auth aware** – include Authorization headers for all requests.

---

# Mercury Frontend Guide (Automatic Scanning)

## 1️⃣ What the Frontend Should Design

### a) Pages / Views

| Page / Component           | Purpose                                               | Backend Interaction                           |
| -------------------------- | ----------------------------------------------------- | --------------------------------------------- |
| **Inbox Page**             | Show list of received emails                          | `myEmails` query, `emailCreated` subscription |
| **Email Detail View**      | Display email body, sender, subject, and scan result  | Email’s `scan` field from `myEmails` query    |
| **Sent Page**              | Show emails sent by the user                          | `myEmails` query filtered with folder="sent"  |
| **Compose Email**          | Form to send new emails                               | `sendEmail` mutation                          |
| **Notifications / Alerts** | Show real-time updates (new emails with scan results) | `emailCreated` subscription                   |
| **User Profile**           | Display user information (optional)                   | `/users/me/` endpoint                         |

**Note:** No scan page or scan form is needed — scans happen automatically.

---

### b) Components to Build

* **EmailList** → Shows a paginated list of emails (Inbox/Sent)
* **EmailItem** → A single email preview with subject, sender, and scan status
* **EmailDetail** → Full content + automatic scan result
* **ComposeEmailForm** → Input fields: To, Subject, Body
* **Notifications** → Toasts or badges for new emails or scan results

---

## 2️⃣ How Frontend Interacts With Backend

### a) GraphQL Queries

* **`myEmails(folder, limit, offset)`** → Fetch emails with scan results included (`scan` field)
* **`myScanLogs(limit, offset)`** → Optional: show historical scans for admin users (if needed)

**Frontend Tasks:**

* Display email lists and scan status in real-time
* No scan submission required

### b) GraphQL Mutations

* **`sendEmail(to, subject, body)`** → Send a new email

**Frontend Tasks:**

* Call mutation on form submission
* UI shows the new sent email
* Backend automatically scans the email, so frontend just observes the scan result via `emailCreated` subscription

### c) GraphQL Subscriptions

* **`emailCreated`** → Listen for incoming emails (Inbox or Sent) with scan results
* **Optional:** Admin users can subscribe to `scanCompleted` for system logs

**Frontend Tasks:**

* Update inbox list in real-time
* Show notifications for new emails (scan result included automatically)

---

## 3️⃣ Backend Features Frontend Uses

| Feature            | Frontend Usage                                     | Notes                                                  |
| ------------------ | -------------------------------------------------- | ------------------------------------------------------ |
| JWT Authentication | Include `Authorization: Bearer <token>` in headers | Backend enforces `login_required`                      |
| Email Sending      | `sendEmail` mutation                               | Backend triggers automatic scanning on creation        |
| Email Inbox        | `myEmails` query + `emailCreated` subscription     | `scan` field included automatically                    |
| Scan Logs          | `myScanLogs` query (optional)                      | Useful for admins, read-only                           |
| Subscriptions      | Real-time updates                                  | Backend sends scanned emails automatically with result |

---

## 4️⃣ State Management Guidelines

* **Cache first**: Use Apollo Client cache to update email list immediately after sending
* **Subscriptions**: Push newly scanned emails automatically into inbox list
* **Hooks**: `useInbox()` to manage emails + real-time updates
* **Optimistic updates**: Only for email sending; scanning is automatic, so no user input required

---

## 5️⃣ Recommended Frontend Architecture

```
src/
├── api/                  # GraphQL queries, mutations, subscriptions
├── components/           # Reusable components (EmailList, EmailItem)
├── hooks/                # Custom hooks (useInbox, useSendEmail)
├── context/              # AuthContext for JWT and user state
├── pages/                # Pages (InboxPage, SentPage, ComposeEmail)
├── utils/                # Helpers (pagination, formatting)
└── subscriptions/        # Subscription handlers (emailCreated)
```

**Key principle:** The frontend never triggers scans manually. It only observes automatic scans performed by the backend.

---

## 6️⃣ Best Practices

1. **Use JWT for all requests** – Backend checks authentication.
2. **Use GraphQL caching & pagination** – Backend supports `limit` and `offset`.
3. **Listen to `emailCreated` subscription** – Inbox updates automatically with scanned emails.
4. **Do not hardcode backend routes** – Use Apollo Client environment URLs.
5. **Error handling** – Backend returns meaningful errors; handle them gracefully.
6. **Optimistic UI updates** – For sending emails only; scan results are automatic.

---

## 7️⃣ Recommended Workflow

**Inbox Example:**

1. Component mounts → call `myEmails` query.
2. Render paginated list with scan results (`scan.result` and `scan.confidence`).
3. Subscribe to `emailCreated` → append new emails automatically.
4. Click email → show `EmailDetail` with automatic scan information.
5. Compose new email → call `sendEmail` mutation → email is sent, backend scans automatically → subscription updates inbox.

---

# Mercury Frontend ↔ Backend Interaction Diagram (Automatic Email Scanning)

```
+------------------+           GraphQL Queries/Mutations        +--------------------+
|                  |------------------------------------------>|                    |
|   Frontend UI    |                                           |    Backend System   |
|------------------|                                           |--------------------|
| - Inbox Page     |                                           | - Django Models     |
| - Email Detail   |                                           |   * Email           |
| - Sent Page      |                                           |   * ScanLog         |
| - Compose Email  |                                           | - Signals           |
|                  |<------------------------------------------| - GraphQL API       |
|                  |         GraphQL Subscriptions             | - Auto Scan Logic   |
+------------------+                                           +--------------------+
        |                                                              ^
        | Send Email Mutation                                           |
        |-------------------------------------------------------------->|
        |                                                              |
        |  Email is saved in DB                                         |
        |  Scan signal triggered automatically                          |
        |                                                              |
        |<-------------------------------------------------------------|
        | Subscription pushes new email + scan result                   |
        |                                                              |
        | Inbox list updates automatically                               |
        v                                                              |
+------------------+                                                   |
| Apollo Client /  |                                                   |
| GraphQL Cache    |                                                   |
|------------------|                                                   |
| - Stores emails  |                                                   |
| - Updates in real-time via subscription                               |
+------------------+                                                   |
```

---

## Flow Explanation

1. **Sending Email**

   * Frontend calls `sendEmail(to, subject, body)` mutation.
   * Backend saves `Email` model instance with `folder="sent"` and `is_outgoing=True`.
   * Signal triggers automatic scan (no frontend involvement).

2. **Automatic Scanning**

   * Backend signal listens to `Email` creation or receipt.
   * Creates a `ScanLog` automatically for the email.
   * Updates the email instance with scan results.

3. **Subscriptions / Real-Time Updates**

   * Backend triggers `emailCreated` subscription (GraphQL) with scanned email.
   * Frontend Apollo Client receives update and adds it to inbox list automatically.

4. **Inbox / Sent Pages**

   * Frontend queries `myEmails(folder="inbox")` or `myEmails(folder="sent")`.
   * Each email has its `scan` field already populated.
   * No manual scanning needed by user.

---

## Notes for Frontend Implementation

* **Inbox updates automatically** — no polling required.
* **Scan results** (`scan.result` and `scan.confidence`) are included in email data.
* **Apollo Cache** keeps the email list synchronized with backend subscription.
* **EmailDetail** can directly access `email.scan` for displaying the result.

---

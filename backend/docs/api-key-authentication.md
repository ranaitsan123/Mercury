# 🔐 API Key Authentication for Service-to-Service Communication

## Overview

The backend supports **API Key authentication** for internal service-to-service communication — specifically for the mail server calling the AI scanner endpoint (`/scanner/scan/`).
This mechanism ensures that only trusted backend services can access sensitive internal APIs.

API keys are **not** meant for end-users.
They are designed for **servers**, **microservices**, and **automated systems**.

---

## Why API Key Authentication?

### 1. Mail Server ≠ User

The mail server is not a human user.
It cannot log in, store JWTs, refresh tokens, or interact with authentication flows.

### 2. JWT Is Not Suitable for Machines

JWT requires a login flow and refresh process.
Backend services need a simple authentication approach.

### 3. Protect Sensitive Endpoints

The `/scanner/scan/` endpoint must be protected against:

* script abuse
* spam requests
* unauthorized clients
* high-cost AI compute usage

### 4. Industry-Standard Pattern

Most platforms use API keys for machine authentication:

* Stripe Webhooks
* GitHub Webhooks
* Google APIs
* Slack apps
* Twilio

Your system applies the same secure pattern.

---

## How API Keys Work

1. **A secret key is generated** and stored in an environment variable:

```
MAILSERVER_API_KEY=super_secret_key_here
```

2. The mail server attaches this key to every request:

```
X-API-KEY: super_secret_key_here
```

3. Django middleware reads the header and validates it:

* If key matches → request proceeds
* If missing/invalid → request is blocked (401 Unauthorized)

4. The key is never exposed to end-users or client-facing applications.

---

## Benefits

| Benefit              | Description                                    |
| -------------------- | ---------------------------------------------- |
| 🔐 Security          | Only trusted services can access internal APIs |
| 🖥️ Service Identity | Mail server proves it is a legitimate caller   |
| 🚫 Abuse Prevention  | Blocks unauthorized or malicious traffic       |
| ⚡ Efficiency         | Middleware denies invalid requests immediately |
| 🔒 Complements JWT   | Users use JWT; servers use API keys            |

---

## Storage and Safety

API keys are:

* stored securely in environment variables
* **never hard-coded**
* not visible in logs or responses
* rotated easily if compromised

This makes API keys **safe and reliable** when properly managed.

---

## Example Mail Server Request

```
POST /scanner/scan/
Headers:
  X-API-KEY: super_secret_key_here
  Content-Type: application/json

Body:
{
  "body": "Email content to scan"
}
```

---

## 🧩 Is there a more dynamic alternative?

Yes — advanced systems use:

### Signed HMAC requests

* The API key is used to generate a hash signature
* The signature changes every request
* Even more secure

### mTLS (Mutual TLS)

* Certificates exchanged instead of keys
* Very secure
* Used in banks / enterprise

### OAuth2 machine-to-machine tokens

* Services authenticate using client_id + client_secret
* Token rotates automatically

**BUT** these are way more complex and unnecessary unless you operate at very large scale.

### For your project:

* ✅ API key is perfect
* ✅ Simple, secure, industry-standard

---

## Summary

API Keys provide a **secure, simple, and industry-standard** method for authenticating backend services in your architecture.
They are essential when one internal service (like the mail server) must communicate with another (the AI scanner) without using JWT or login flows.

This ensures that only authorized systems can perform operations, protecting your backend from abuse and ensuring safe internal communication.


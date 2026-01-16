# 🔐 Backend Authentication API – Frontend Documentation

**Base URL (dev):**

```
http://localhost:8000
```

**Auth type:** JWT (Bearer tokens)
**Transport:** JSON over HTTP
**State:** Stateless (no cookies, no sessions)

---

## 1️⃣ Signup (Create Account)

### Endpoint

```
POST /users/signup/
```

### Description

Creates a new user account.
Does **not** log the user in automatically.

### Request Headers

```
Content-Type: application/json
```

### Request Body

```json
{
  "username": "alice",
  "email": "alice@test.com",
  "password": "secret123"
}
```

### Success Response (201)

```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@test.com"
}
```

### Error Responses

| Status | Meaning                 |
| ------ | ----------------------- |
| 400    | Missing fields          |
| 400    | Username already exists |

---

## 2️⃣ Login (JWT Token)

### Endpoint

```
POST /auth/token/
```

### Description

Authenticates user and returns JWT tokens.

### Request Headers

```
Content-Type: application/json
```

### Request Body

```json
{
  "username": "alice",
  "password": "secret123"
}
```

### Success Response (200)

```json
{
  "access": "<JWT_ACCESS_TOKEN>",
  "refresh": "<JWT_REFRESH_TOKEN>"
}
```

### Notes

* Store both tokens securely
* Use **access token** for API calls
* Use **refresh token** to get a new access token

---

## 3️⃣ Get Current User (Who Am I)

### Endpoint

```
GET /users/me/
```

### Description

Returns the authenticated user’s profile.

### Request Headers

```
Authorization: Bearer <ACCESS_TOKEN>
```

### Success Response (200)

```json
{
  "id": 1,
  "username": "alice",
  "email": "alice@test.com",
  "role": "user"
}
```

### Error Responses

| Status | Meaning                  |
| ------ | ------------------------ |
| 401    | Missing or invalid token |

---

## 4️⃣ Refresh Access Token

### Endpoint

```
POST /auth/token/refresh/
```

### Description

Generates a new access token using the refresh token.

### Request Headers

```
Content-Type: application/json
```

### Request Body

```json
{
  "refresh": "<REFRESH_TOKEN>"
}
```

### Success Response (200)

```json
{
  "access": "<NEW_ACCESS_TOKEN>"
}
```

---

## 5️⃣ Logout

### Endpoint

❌ No backend endpoint

### How logout works

Logout is handled **entirely on the frontend**.

### Frontend logout steps

1. Delete access token
2. Delete refresh token
3. Clear user state
4. Redirect to login page

```js
localStorage.removeItem("access");
localStorage.removeItem("refresh");
```

---

## 6️⃣ Authentication Header (Required for Protected APIs)

All protected endpoints require:

```
Authorization: Bearer <ACCESS_TOKEN>
```

Example:

```http
GET /users/me/
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

---

## 7️⃣ Typical Frontend Auth Flow

```text
Signup
  ↓
Login
  ↓
Save tokens
  ↓
GET /users/me/
  ↓
Store user in app state
  ↓
Allow access to protected routes
```

---

## 8️⃣ Token Handling Rules (Important)

* Access tokens expire → refresh them
* Refresh tokens should not be sent on every request
* If `/users/me/` returns 401 → log out user
* Do NOT store tokens in cookies (localStorage or memory only)

---

## 9️⃣ Auth-Related URLs Summary

| Purpose       | Method | URL                    |
| ------------- | ------ | ---------------------- |
| Signup        | POST   | `/users/signup/`       |
| Login         | POST   | `/auth/token/`         |
| Refresh token | POST   | `/auth/token/refresh/` |
| Current user  | GET    | `/users/me/`           |
| Logout        | —      | Frontend only          |

---

## 10️⃣ Notes for Frontend Developer

* Backend uses **JWT**, not cookies
* No CSRF handling required
* Works with REST & GraphQL
* Same token authorizes GraphQL requests


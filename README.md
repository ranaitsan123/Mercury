# Intelligent Mail Server

An **Intelligent Mail Server** is a secure, modular email platform that combines a modern web interface, a robust backend, and a Machine Learning–based scanner to enhance email security (spam/phishing/malware detection) while maintaining scalability and clean architecture.

This project was designed with a strong focus on **architecture**, **security**, and **future extensibility**, making it suitable for academic projects, demonstrations, and real-world evolution.

---

## 📌 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [System Architecture](#3-system-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Application Workflow](#5-application-workflow)
6. [Security Mechanisms](#6-security-mechanisms)
7. [Machine Learning Scanner](#7-machine-learning-scanner)
8. [Installation & Setup](#8-installation--setup)
9. [Dockerized Deployment](#9-dockerized-deployment)
10. [API Overview](#10-api-overview)
11. [Future Improvements](#11-future-improvements)
12. [Conclusion](#12-conclusion)

---

## 1. Project Overview

The Intelligent Mail Server allows users to:

- Register and authenticate securely
- Send and receive emails through a web interface
- Automatically analyze incoming emails using a Machine Learning scanner
- Protect the system against common email-based threats (spam, phishing, malicious content)

The system is built using a **microservice-oriented approach**, separating concerns between frontend, backend, and ML services.

---

## 2. Key Features

- ✉️ Email sending and receiving
- 🔐 Secure authentication (JWT)
- 🧠 Machine Learning–powered email scanning
- 🧩 GraphQL-only business logic (no direct REST usage)
- 🐳 Docker-based backend & services
- ⚡ **Redis-ready architecture** (cache, async, rate limiting)
- 👮 Admin interface for monitoring & auditing emails
- 📊 Clear separation between frontend, backend, and ML services

---

## 3. System Architecture

The system follows a **clean, layered architecture** with strict separation of concerns and **GraphQL-only communication** between frontend and backend.

### Frontend (Web Client)

- Built as a modern SPA
- **Communicates exclusively via GraphQL** (queries & mutations)
- No REST calls for business features
- Handles:
  - Authentication
  - Inbox & Sent views
  - Email composition
  - Threat visualization

The frontend is **not containerized** and is launched locally using:

```bash
pnpm run dev
```

### Backend (Application Server)

- Django + GraphQL (Graphene)
- Single GraphQL endpoint
- Central business logic
- Security, routing, and scanning orchestration

### ML Scanner Service

- Independent microservice
- Automatically scans **every email**
- Cannot be bypassed

```
[ Frontend (GraphQL) ]  →  [ Backend GraphQL API ]  →  [ Database ]
                                   ↓
                            [ ML Scanner Service ]
```

---

## 4. Technology Stack

### Frontend

- HTML / CSS / JavaScript
- (Optional framework depending on implementation)

### Backend

- Python (FastAPI / Flask / Django REST – depending on implementation)
- JWT for authentication
- RESTful API architecture

### Machine Learning

- Python
- FastAPI for ML service exposure
- Pre-trained or custom ML model for email classification

### Infrastructure

- Docker & Docker Compose
- REST communication between services

---

## 5. Application Workflow

### Authentication Workflow

1. User submits credentials via frontend
2. Frontend sends **GraphQL mutation** (`login`)
3. Backend validates credentials
4. JWT access & refresh tokens are issued
5. Frontend stores tokens securely
6. All future GraphQL requests are authenticated

📌 **Diagram provided:** Use Case + Sequence Diagram (Authentication)

### Sending an Email

1. User composes an email in the frontend
2. Frontend sends `sendEmail` **GraphQL mutation**
3. Backend creates the Email entity
4. **Email content is automatically sent to the ML Scanner**
5. Scanner returns classification result
6. Backend stores:
   - Email
   - Scan result (linked 1–1)
7. Email appears in the **Sent** folder

📌 **Diagrams provided:**
- Use Case Diagram (Send Email)
- Sequence Diagram (Send Email)
- Class Diagram (Email + ScanLog)

### Receiving an Email

1. Backend receives or simulates an incoming email
2. Email is **never stored directly**
3. Backend sends content to ML Scanner
4. Scanner analyzes subject + body
5. Result is returned (safe / malicious + confidence)
6. Backend stores Email **only after scan**
7. Email becomes visible in Inbox

📌 **Diagrams provided:**
- Use Case Diagram (Receive Email)
- Sequence Diagram (Receive Email)

---

## 6. Security Mechanisms

Security is enforced **by design**, not as an afterthought.

### Authentication & Authorization

- REST-based authentication (JWT only)
- GraphQL protected by authentication middleware
- Role-based access control (User / Admin)

### Mandatory Email Scanning

- **Every email is scanned automatically**
- Scanning occurs **before storage and before serving**
- No email exists without an associated scan result
- Scanner service cannot be bypassed

### Middleware & Audit Layer

- Request authentication & authorization
- Centralized logging
- Trace ID generation for every request
- Admin-only access to security and scan data

### Admin Monitoring

- Admin interface allows:
  - Monitoring emails
  - Viewing scan results
  - Auditing suspicious or malicious activity

---

## 7. Machine Learning Scanner

The ML Scanner is a **mandatory security component**, implemented as an independent microservice.

### Key Properties

- Triggered automatically for **every email creation**
- Scans both subject and body
- Returns:
  - Classification (safe / malicious)
  - Confidence score

### Design Benefits

- Strong isolation from backend logic
- Easy model replacement or retraining
- Independent scalability

📌 **Diagram provided:** Class Diagram (Scanner, ScanLog, Email)

---

## 8. Installation & Setup

### Prerequisites

- Node.js + pnpm
- Docker & Docker Compose
- Git

### Clone the Repository

```bash
git clone <repository-url>
cd intelligent-mail-server
```

### Frontend Setup (Local)

```bash
cd frontend
pnpm install
pnpm run dev
```

### Backend & Services

```bash
docker compose up --build
```

---

## 9. Dockerized Deployment

The project uses **Docker Compose** to orchestrate services:

- frontend
- backend
- ml_scanner
- database

### Run the Project

```bash
docker compose up --build
```

This command:

- Builds all images
- Starts all services
- Connects them on a shared Docker network

---

## 10. API Overview

### Authentication

- `POST /auth/login`
- `POST /auth/register`

### Emails

- `GET /emails/inbox`
- `POST /emails/send`

### ML Scanner

- `POST /scan-email`

(All endpoints are protected where necessary using JWT.)

---

## 11. Future Improvements

The project was designed to be **extensible and security-oriented**. Planned improvements include:

### Performance & Scalability

- Redis integration for:
  - Caching GraphQL queries
  - Token/session optimization
  - Rate limiting
- Celery for asynchronous processing

### Advanced Administration

- Enhanced admin dashboard
- Rich audit trails (email lifecycle, scan history)
- Advanced filtering & search
- Exportable audit logs

### Security Ecosystem Integration

- Integration with external security tools:
  - SIEM platforms
  - IDS / IPS systems
  - SOC dashboards
- Real-time alerting for malicious emails

### Infrastructure

- Integration with real mail servers (SMTP / AWS SES)
- Observability (Prometheus, Grafana)
- Distributed tracing

---

## 12. Conclusion

This Intelligent Mail Server is a **security-first, GraphQL-driven system** designed for modern applications.

Key strengths:

- Strict API contract (REST for auth, GraphQL for everything else)
- Mandatory ML-based email scanning
- Admin-level audit and monitoring capabilities
- Redis-ready and integration-friendly design

The architecture makes this project suitable for:

- Academic demonstrations
- Security-focused system design
- Integration into larger enterprise security ecosystems

---

📌 *Designed to be auditable, extensible, and ready for real-world security integration.*

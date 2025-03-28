# Document Management System with NestJS

## Overview

A production-ready document management system built with NestJS that provides secure document handling with role-based access control, document processing pipeline, and microservices architecture. The system features:

- 🔐 **Secure Authentication** : JWT-based authentication with password hashing
- 🛡️ **Granular Authorization** : Role-based permissions using CASL
- 📄 **Document Processing** : Mock ingestion service with status tracking
- 📊 **Database Management** : PostgreSQL with TypeORM for data persistence
- 🐇 **Microservices** : RabbitMQ for asynchronous communication
- 📚 **API Documentation** : Comprehensive Swagger/OpenAPI documentation

## System Architecture

```
┌─────────────────────┐     ┌──────────────────┐      ┌──────────────────┐
│                     │     │                  │      │                  │
│   NestJS API        │───▶│  PostgreSQL      │──▶ │   RabbitMQ       │
│   (Main Service)    │     │  (Primary DB)    │      │  (Message Broker)│
│                     │     │                  │      │                  │
└─────────┬───────────┘     └──────────────────┘      └────────┬─────────┘
          │                                                    │
          │                                                    │
┌─────────▼───────────┐                              ┌─────────▼─────────┐
│                     │                              │                   │
│   Authentication    │                              │   Ingestion       │
│   Service           │                              │   Worker          │
│                     │                              │   (Microservice)  │
└─────────────────────┘                              └───────────────────┘
```

## Key Features

### 🔐 Authentication & Authorization System

- **JWT Implementation** : Secure token-based authentication

  - (`backend/src/auth/strategies/jwt.strategy.ts`)

- **Auth Guards** : Protects routes from unauthorized access

  - (`backend/src/utils/guards/auth.guard.ts`)

- **CASL Permission Management** : Fine-grained access control based on user roles
- Ability factory:

  - `backend/src/casl/casl-ability.factory`

* Policy guard:
  - `backend/src/utils/guards/policy.guard.ts`

### User Roles

1. **Admin (Full Control)**
   This user can any operations in the application such as

   - Create, read, update, and delete all documents
   - Register new User
   - Create and get details of an Ingestion

2. **Editor (Content Management)**

   - Create new documents
   - Read and update existing documents
   - Create and Details of ingestion

3. **Viewer (Read-Only)**

   - View documents and metadata
   - No modification capabilities
   - Details of ingestion

### 📄 Document Processing Pipeline

- **Ingestion Service** : Mock implementation that simulates document processing
- **Status Tracking** : Real-time updates on document processing state

# 🚀 Getting Started

## Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.5+)
- Node.js (v18+ recommended)

## Quick Start

```bash
# Clone repository
git clone https://github.com/sweta-sks/jk-tech && cd jk-tech

# Build and start containers
docker-compose build
docker-compose up -d

# Verify services are running
docker-compose ps
```

## API Access

### Accessing Swagger UI

After starting the services, the interactive API documentation is available at:
🔗 [http://localhost:4000/api/doc](http://localhost:4000/api/doc)

### Admin Authentication

```bash
curl -X 'POST' \
  'http://localhost:4000/api/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@jkTech.com","password":"admin@123"}'
```

Sample Response:

```
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

}
```

## Key API Endpoints

### 1. Document Management

**`GET /api/v1/documents`** - List all accessible documents
**`POST /api/v1/documents`** - Upload new document
**`GET /api/v1/documents/{id}`** - Get document details
**`PATCH /api/v1/documents/{id}`** - Update document metadata
**`DELETE /api/v1/documents/{id}`** - Delete document (Admin only)

### 2. Document Ingestion Endpoint

**`POST /api/v1/ingestion`**

Purpose: Initiates document processing workflow

Request:

```
{
  "documentId": "string"
}
```

- Response:

  ```
  {
    "message": "Ingestion started",
    "ingestionId": "32f5c7dd-d071-4564-b431-e749bb6b3815",
    "status": "processing"
  }
  ```

#### 3. Check Ingestion Status Endpoint

**`GET /api/v1/ingestion/{id}`**

- Purpose: Checks the status of a specific ingestion process
- Request Parameter: `id` (the ingestionId from the first endpoint)
- Response:

  ```
  {
    "id": "32f5c7dd-d071-4564-b431-e749bb6b3815",
    "documentId": "string",
    "userId": "65b47002-dd94-475b-a0e1-81669ce83da7",
    "status": "failed",
    "createdAt": "2025-03-28T00:27:18.941Z",
    "updatedAt": "2025-03-28T00:27:24.081Z"
  }
  ```

## 4. User Registration (Admin Only)

**Endpoint:**
`POST /api/v1/user/register`
_Requires Admin privileges_

### Request

```
curl -X 'POST' \
  'http://localhost:4000/api/v1/user/register' \
  -H 'Authorization: Bearer YOUR_ADMIN_JWT' \
  -H 'Content-Type: application/json' \
  -d '{
    "role": "VIEWER",
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "SecurePass123!"
  }'
```

| Field      | Type   | Required | Description               | Allowed Values              |
| ---------- | ------ | -------- | ------------------------- | --------------------------- |
| `role`     | string | Yes      | User's role in the system | `ADMIN`, `EDITOR`, `VIEWER` |
| `name`     | string | Yes      | Full name of the user     | 2-100 characters            |
| `email`    | string | Yes      | Unique email address      | Valid email format          |
| `password` | string | Yes      | Account password          | Min 12 characters           |

## Successful Response (201 Created)

```
{
  "id": "cd1bf425-7857-4090-a02e-9861ef722011",
  "role": {
    "id": "e2676c70-faef-4c61-b285-bdd75abcbd71"
  },
  "name": "John Doe",
  "email": "johndoe@example.com",
  "createdAt": "2025-03-28T08:21:26.252Z",
  "updatedAt": "2025-03-28T08:21:26.252Z"
}
```

## Testing (QA)

### Prerequisites

Before running tests, ensure all dependencies are installed:

```
# Using npm
npm install

# OR using yarn
yarn install
```

### Running Tests

```
# Run all unit tests
npm test

# Run tests with coverage report
npm run test:cov

# Run specific test file (example)
npm test user.service

# Run e2e tests
npm run test:e2e
```

# Author

Sweta Kumari Singh

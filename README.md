# Document Management System with NestJS

## Overview

A robust document management system built with NestJS, PostgreSQL, and RabbitMQ, featuring:

- JWT authentication with role-based access control
- Document processing pipeline with mock ingestion service
- Comprehensive API documentation via Swagger

## System Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   NestJS    │───▶│ PostgreSQL  │    │  RabbitMQ   │
│  API Gateway│    │  (TypeORM)  │◀──▶│ (Microservices)
└─────────────┘    └─────────────┘    └─────────────┘
```

## Key Components

### Authentication & Authorization

- JWT implementation: `backend/src/auth/strategies/jwt.strategy.ts`
- Auth guard: `backend/src/utils/guards/auth.guard.ts`
- CASL permission management:
  - `backend/src/casl/casl-ability.factory`
  - `backend/src/utils/guards/policy.guard.ts`

### User Roles

1. **Admin**: Full CRUD operations
2. **Editor**: Create, read, and update operations
3. **Viewer**: Read-only access

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

### Swagger Documentation

Available at: http://localhost:4000/api/doc

### Admin Authentication

```bash
curl -X 'POST' \
  'http://localhost:4000/api/v1/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@jkTech.com","password":"admin@123"}'
```

### Key Endpoints:

#### 1. Start Ingestion Endpoint

**`POST /api/v1/ingestion`**

- Purpose: Triggers processing of a document
- Request:

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

#### 2. Check Ingestion Status Endpoint

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

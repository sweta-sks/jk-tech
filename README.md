Here's the enhanced README file incorporating all your requirements in a clean, developer-friendly format:

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
git clone [repository-url] && cd [project-directory]

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

- `POST /api/v1/ingestion`- Trigger processing
- `GET /api/v1/ingestion/{id}` - Check status and detail

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

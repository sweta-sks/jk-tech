# Document Management System with NestJS

## Overview

This project is a Document Management System built with NestJS, PostgreSQL, and RabbitMQ. It features role-based access control, JWT authentication, and document processing capabilities with a mock ingestion service.

## Key Features

- **User Authentication**: JWT-based login system
- **Role-Based Access Control**:
  - Admin: Full CRUD operations
  - Editor: Create, Read, Update operations
  - Viewer: Read-only access
- **Document Management**: Upload, retrieve, update, and delete documents
- **Ingestion Service**: Mock microservice for document processing (simulating Python backend)
- **API Documentation**: Swagger UI available at `/api/doc`

## System Architecture

- **Backend**: NestJS
- **Database**: PostgreSQL (TypeORM)
- **Authentication**: JWT
- **Authorization**: CASL for permission management
- **Message Queue**: RabbitMQ for microservice communication

## Prerequisites

- Docker
- Docker Compose
- Node.js (v16+ recommended)

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd [project-directory]
   ```

2. **Build and start containers**

   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. **Access the application**

   - API: `http://localhost:4000`
   - Swagger UI: `http://localhost:4000/api/doc`
   - PostgreSQL: Port 5432

## API Usage

### Authentication

Admin login example:

```bash
curl -X 'POST' \
  'http://localhost:4000/api/v1/auth/login' \
  -H 'accept: */*' \
  -H 'Content-Type: application/json' \
  -d '{
  "password": "admin@123",
  "email": "admin@jkTech.com"
}'
```

### Document Operations

All document endpoints require JWT authentication. Include the token in the `Authorization` header.

## Mock Ingestion Service

The system includes a mock ingestion service that simulates:

- Document processing
- Status tracking

## Testing (For QA)

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

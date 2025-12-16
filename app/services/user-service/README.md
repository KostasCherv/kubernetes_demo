# User Service

User management service with PostgreSQL database integration that provides CRUD operations for users.

## Overview

The User Service handles:
- User CRUD operations (Create, Read, Update, Delete)
- PostgreSQL database integration
- Automatic database table initialization

## Local Development

### Prerequisites
- Node.js 18+
- npm
- PostgreSQL database running (or use Docker)

### Run Locally

```bash
npm install
npm start
```

The service runs on `http://localhost:3000`

**Note:** For local development, you may need to set database environment variables:
```bash
DATABASE_HOST=localhost \
DATABASE_PORT=5432 \
DATABASE_NAME=microservices_db \
DATABASE_USER=postgres \
DATABASE_PASSWORD=postgres123 \
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### User Operations
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
  ```json
  Request: { "name": "John Doe", "email": "john@example.com" }
  Response: { "id": 1, "name": "John Doe", "email": "john@example.com", "created_at": "2024-01-01T00:00:00.000Z" }
  ```
- `PUT /users/:id` - Update user
  ```json
  Request: { "name": "Jane Doe", "email": "jane@example.com" }
  Response: { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "created_at": "2024-01-01T00:00:00.000Z" }
  ```
- `DELETE /users/:id` - Delete user

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster running
- Docker installed
- kubectl configured
- **PostgreSQL database deployed** (see `../../database/README.md`)

### Build Docker Image

```bash
docker build -t user-service:latest .
```

### Deploy to Kubernetes

1. **Ensure database is deployed first**:
```bash
cd ../../database
kubectl apply -f secret.yaml
kubectl apply -f service.yaml
kubectl apply -f statefulset.yaml
```

2. **Create namespace** (if not exists):
```bash
kubectl apply -f ../../namespace.yaml
```

3. **Deploy user service resources**:
```bash
cd ../services/user-service
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### Check Status

```bash
# Check pods
kubectl get pods -n k8s-microservices -l app.kubernetes.io/name=user-service

# Check service
kubectl get svc -n k8s-microservices user-service

# View logs
kubectl logs -n k8s-microservices -l app.kubernetes.io/name=user-service --tail=50
```

### Test the Service

```bash
# Port forward to test locally
kubectl port-forward -n k8s-microservices svc/user-service 3000:3000

# Test health endpoint (checks database connection)
curl http://localhost:3000/health

# Test endpoints
curl http://localhost:3000/users
curl http://localhost:3000/users/1
curl http://localhost:3000/users -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

## Access via API Gateway (Ingress)

Once deployed, the service is accessible through the API Gateway via Ingress on port 80:

### Get All Users

```bash
curl http://localhost/users
```

### Get User by ID

```bash
curl http://localhost/users/1
```

### Create User

```bash
curl http://localhost/users -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'
```

### Update User

```bash
curl http://localhost/users/1 -X PUT \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com"}'
```

### Delete User

```bash
curl http://localhost/users/1 -X DELETE
```

### Request Flow

```
Client Request
    ↓
http://localhost/users (Ingress - port 80)
    ↓
API Gateway Service (port 3000)
    ↓
/users route → http://user-service:3000/users
    ↓
User Service Pod
    ↓
PostgreSQL Database
```

## Database Integration

### Database Schema

The service automatically creates a `users` table on startup:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Database Connection

The service connects to PostgreSQL using:
- **Host**: `postgres` (Kubernetes service name)
- **Port**: `5432`
- **Database**: `microservices_db`
- **Credentials**: From `postgres-secret` (deployed with database)

## Configuration

Configuration is managed via ConfigMap (`k8s/configmap.yaml`):
- `DATABASE_HOST`: PostgreSQL service name
- `DATABASE_PORT`: Database port (default: 5432)
- `DATABASE_NAME`: Database name

Database credentials are injected from the `postgres-secret` Secret via environment variables in the Deployment.

## Kubernetes Resources

- **Deployment**: Manages user service pods with 2 replicas
- **Service**: ClusterIP service exposing port 3000
- **ConfigMap**: Contains database connection configuration
- **Secret Reference**: Database credentials from `postgres-secret`
- **Health Probes**: Liveness and readiness probes on `/health` endpoint (includes database connectivity check)

## Dependencies

- **pg**: PostgreSQL client for Node.js
- **express**: Web framework


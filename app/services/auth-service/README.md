# Auth Service

Authentication service with PostgreSQL database integration that provides login and JWT token validation endpoints.

## Overview

The Auth Service handles:
- User login with database authentication
- JWT token generation and validation
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

### Authentication
- `POST /login` - User login (requires username and password, returns JWT token)
  ```json
  Request: { "username": "testuser", "password": "testpass123" }
  Response: { "token": "jwt-token", "user": { "id": 1, "username": "testuser", "email": "test@example.com" } }
  ```
- `GET /validate` - Validate JWT token (requires Authorization header)
  ```
  Headers: Authorization: Bearer <token>
  Response: { "valid": true, "user": { "id": 1, "username": "testuser" } }
  ```

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster running
- Docker installed
- kubectl configured
- **PostgreSQL database deployed** (see `../../database/README.md`)

### Build Docker Image

```bash
docker build -t auth-service:latest .
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

3. **Deploy auth service resources**:
```bash
cd ../services/auth-service
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### Check Status

```bash
# Check pods
kubectl get pods -n k8s-microservices -l app.kubernetes.io/name=auth-service

# Check service
kubectl get svc -n k8s-microservices auth-service

# View logs
kubectl logs -n k8s-microservices -l app.kubernetes.io/name=auth-service --tail=50
```

### Test the Service

```bash
# Port forward to test locally
kubectl port-forward -n k8s-microservices svc/auth-service 3000:3000

# Test health endpoint (checks database connection)
curl http://localhost:3000/health

# Test login with default test user
curl http://localhost:3000/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'

# Test token validation (use token from login response)
curl http://localhost:3000/validate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Access via API Gateway (Ingress)

Once deployed, the service is accessible through the API Gateway via Ingress on port 80:

### Login Endpoint

```bash
# Login and get JWT token
curl http://localhost/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### Validate Token Endpoint

```bash
# Validate JWT token (use token from login response)
curl http://localhost/auth/validate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "username": "testuser"
  }
}
```

### Complete Example Flow

```bash
# 1. Login and extract token
TOKEN=$(curl -s http://localhost/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}' | jq -r '.token')

echo "Token: $TOKEN"

# 2. Validate the token
curl http://localhost/auth/validate \
  -H "Authorization: Bearer $TOKEN"
```

### Request Flow

```
Client Request
    ↓
http://localhost/auth/login (Ingress - port 80)
    ↓
API Gateway Service (port 3000)
    ↓
/auth/login route → http://auth-service:3000/login
    ↓
Auth Service Pod
    ↓
PostgreSQL Database
```

## Database Integration

### Database Schema

The service automatically creates a `users` table on startup:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Default Test User

A default test user is automatically created:
- **Username**: `testuser`
- **Password**: `testpass123`
- **Email**: `test@example.com`

### Database Connection

The service connects to PostgreSQL using:
- **Host**: `postgres` (Kubernetes service name)
- **Port**: `5432`
- **Database**: `microservices_db`
- **Credentials**: From `postgres-secret` (deployed with database)

Connection details are configured via:
- **ConfigMap**: Database host, port, name, JWT secret
- **Secret Reference**: Database username and password from `postgres-secret`

## Configuration

Configuration is managed via ConfigMap (`k8s/configmap.yaml`):
- `DATABASE_HOST`: PostgreSQL service name
- `DATABASE_PORT`: Database port (default: 5432)
- `DATABASE_NAME`: Database name
- `JWT_SECRET`: Secret key for JWT token signing

Database credentials are injected from the `postgres-secret` Secret via environment variables in the Deployment.

## Kubernetes Resources

- **Deployment**: Manages auth service pods with 2 replicas
- **Service**: ClusterIP service exposing port 3000
- **ConfigMap**: Contains database connection and JWT configuration
- **Secret Reference**: Database credentials from `postgres-secret`
- **Health Probes**: Liveness and readiness probes on `/health` endpoint (includes database connectivity check)

## How Database Integration Works

1. **On Startup**: 
   - Service connects to PostgreSQL using credentials from environment variables
   - Automatically creates `users` table if it doesn't exist
   - Creates a default test user for testing

2. **Login Flow**:
   - Client sends username and password
   - Service queries PostgreSQL to verify credentials
   - If valid, generates JWT token and returns it
   - If invalid, returns 401 error

3. **Token Validation**:
   - Client sends JWT token in Authorization header
   - Service verifies token signature and expiration
   - Optionally verifies user still exists in database
   - Returns validation result

4. **Health Check**:
   - `/health` endpoint checks database connectivity
   - Returns 503 if database is unreachable

## Dependencies

- **pg**: PostgreSQL client for Node.js
- **jsonwebtoken**: JWT token generation and validation
- **express**: Web framework

## Next Steps

- [x] Database integration
- [x] JWT token generation
- [ ] Add password hashing (bcrypt)
- [ ] Implement token refresh mechanism
- [ ] Add user registration endpoint
- [ ] Add password reset functionality


# API Gateway

Simple API Gateway service that routes requests to backend microservices (Auth, User, Product).

## Overview

The API Gateway acts as a single entry point for all client requests, proxying them to the appropriate backend services. It handles routing, request forwarding, and provides a unified API interface.

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Run Locally

```bash
npm install
npm start
```

The service runs on `http://localhost:3000`

### Environment Variables (Optional)

For local development, you can override service URLs:

```bash
AUTH_SERVICE_HOST=http://localhost:3001 \
USER_SERVICE_HOST=http://localhost:3002 \
PRODUCT_SERVICE_HOST=http://localhost:3003 \
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Auth Service
- `POST /auth/login` - User login
- `GET /auth/validate` - Validate token

### User Service
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PUT /users/:id` - Update user

### Product Service
- `GET /products` - List all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product
- `PUT /products/:id` - Update product

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster running
- Docker installed
- kubectl configured
- Ingress Controller installed (nginx)

### Build Docker Image

```bash
docker build -t api-gateway:latest .
```

### Deploy to Kubernetes

1. **Create namespace** (if not exists):
```bash
kubectl apply -f ../../namespace.yaml
```


2. **Deploy resources**:
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

3. **Deploy Ingress**:
```bash
kubectl apply -f ../../ingress/api-gateway-ingress.yaml
```

### Check Status

```bash
# Check pods
kubectl get pods -n k8s-microservices -l app.kubernetes.io/name=api-gateway

# Check service
kubectl get svc -n k8s-microservices api-gateway

# Check ingress
kubectl get ingress -n k8s-microservices

# View logs
kubectl logs -n k8s-microservices -l app.kubernetes.io/name=api-gateway --tail=50
```

### Access the Service

Once deployed, access the API Gateway via Ingress:

```bash
# Health check
curl http://localhost/health

# Test endpoints
curl http://localhost/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"test"}'
curl http://localhost/users
curl http://localhost/products
```

**Note:** The service is accessible on port 80 via Ingress, not directly on port 3000.

## Configuration

Service URLs are configured via ConfigMap (`k8s/configmap.yaml`):
- `AUTH_SERVICE_HOST`: Auth service URL
- `USER_SERVICE_HOST`: User service URL
- `PRODUCT_SERVICE_HOST`: Product service URL

In Kubernetes, these default to:
- `http://auth-service:3000`
- `http://user-service:3000`
- `http://product-service:3000`

## Kubernetes Resources

- **Deployment**: Manages API Gateway pods with 2 replicas
- **Service**: ClusterIP service exposing port 3000
- **ConfigMap**: Contains service URL configurations
- **Ingress**: Routes external traffic to the service
- **Health Probes**: Liveness and readiness probes on `/health` endpoint
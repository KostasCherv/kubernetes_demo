# Product Service

Product management service with PostgreSQL database integration that provides CRUD operations for products.

## Overview

The Product Service handles:
- Product CRUD operations (Create, Read, Update, Delete)
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

### Product Operations
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product
  ```json
  Request: { "name": "Laptop", "description": "High-performance laptop", "price": 999.99 }
  Response: { "id": 1, "name": "Laptop", "description": "High-performance laptop", "price": "999.99", "created_at": "2024-01-01T00:00:00.000Z" }
  ```
- `PUT /products/:id` - Update product
  ```json
  Request: { "name": "Gaming Laptop", "description": "Updated description", "price": 1299.99 }
  Response: { "id": 1, "name": "Gaming Laptop", "description": "Updated description", "price": "1299.99", "created_at": "2024-01-01T00:00:00.000Z" }
  ```
- `DELETE /products/:id` - Delete product

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster running
- Docker installed
- kubectl configured
- **PostgreSQL database deployed** (see `../../database/README.md`)

### Build Docker Image

```bash
docker build -t product-service:latest .
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

3. **Deploy product service resources**:
```bash
cd ../services/product-service
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### Check Status

```bash
# Check pods
kubectl get pods -n k8s-microservices -l app.kubernetes.io/name=product-service

# Check service
kubectl get svc -n k8s-microservices product-service

# View logs
kubectl logs -n k8s-microservices -l app.kubernetes.io/name=product-service --tail=50
```

### Test the Service

```bash
# Port forward to test locally
kubectl port-forward -n k8s-microservices svc/product-service 3000:3000

# Test health endpoint (checks database connection)
curl http://localhost:3000/health

# Test endpoints
curl http://localhost:3000/products
curl http://localhost:3000/products/1
curl http://localhost:3000/products -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","description":"High-performance laptop","price":999.99}'
```

## Access via API Gateway (Ingress)

Once deployed, the service is accessible through the API Gateway via Ingress on port 80:

### Get All Products

```bash
curl http://localhost/products
```

### Get Product by ID

```bash
curl http://localhost/products/1
```

### Create Product

```bash
curl http://localhost/products -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","description":"High-performance laptop","price":999.99}'
```

### Update Product

```bash
curl http://localhost/products/1 -X PUT \
  -H "Content-Type: application/json" \
  -d '{"name":"Gaming Laptop","description":"Updated description","price":1299.99}'
```

### Delete Product

```bash
curl http://localhost/products/1 -X DELETE
```

### Request Flow

```
Client Request
    ↓
http://localhost/products (Ingress - port 80)
    ↓
API Gateway Service (port 3000)
    ↓
/products route → http://product-service:3000/products
    ↓
Product Service Pod
    ↓
PostgreSQL Database
```

## Database Integration

### Database Schema

The service automatically creates a `products` table on startup:

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
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

- **Deployment**: Manages product service pods with 2 replicas
- **Service**: ClusterIP service exposing port 3000
- **ConfigMap**: Contains database connection configuration
- **Secret Reference**: Database credentials from `postgres-secret`
- **Health Probes**: Liveness and readiness probes on `/health` endpoint (includes database connectivity check)

## Dependencies

- **pg**: PostgreSQL client for Node.js
- **express**: Web framework


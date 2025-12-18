# Ingress Configuration

Kubernetes Ingress resources for exposing services externally.

## Ingress Resources

### Frontend Ingress
**File**: `frontend-ingress.yaml`

- **Path**: `/` (root)
- **Service**: `frontend:3000`
- **Purpose**: Serves the Next.js dashboard application

### API Gateway Ingress
**File**: `api-gateway-ingress.yaml`

- **Path**: `/api/*`
- **Service**: `api-gateway:3000`
- **Rewrite**: `/api/*` → `/*` (strips `/api` prefix)
- **Purpose**: Routes all API requests to the API Gateway

## Deployment

```bash
# Apply all ingress resources
kubectl apply -f app/ingress/

# Check ingress status
kubectl get ingress -n k8s-microservices

# View ingress details
kubectl describe ingress -n k8s-microservices
```

## Access

- **Frontend**: `http://localhost/`
- **API**: `http://localhost/api/*`

## Notes

- Requires an Ingress Controller (e.g., NGINX Ingress Controller)
- Both ingress resources use the `nginx` ingress class
- The API Gateway ingress uses path rewriting to remove the `/api` prefix before forwarding to the service



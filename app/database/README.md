# PostgreSQL Database

PostgreSQL database for the microservices application using StatefulSet with persistent storage.

## Overview

This database setup provides:
- **StatefulSet**: Ensures stable pod identity and ordered operations
- **Persistent Storage**: 2Gi PVC for data persistence
- **Health Probes**: Liveness and readiness checks using `pg_isready`
- **Secret Management**: Database credentials stored in Kubernetes Secret

## Database Configuration

- **Database Name**: `microservices_db`
- **Username**: `postgres`
- **Password**: `postgres123`
- **Port**: `5432`
- **Storage**: 2Gi (ReadWriteOnce)

## Deployment

### 1. Deploy Database Resources

```bash
# Deploy in order
kubectl apply -f secret.yaml
kubectl apply -f service.yaml
kubectl apply -f statefulset.yaml
```

### 2. Check Deployment Status

```bash
# Check StatefulSet
kubectl get statefulset -n k8s-microservices postgres

# Check Pods
kubectl get pods -n k8s-microservices -l app.kubernetes.io/name=postgres

# Check PVCs (Persistent Volume Claims)
kubectl get pvc -n k8s-microservices

# Check Service
kubectl get svc -n k8s-microservices postgres
```

### 3. Verify Database is Running

```bash
# Check pod logs
kubectl logs -n k8s-microservices postgres-0 --tail=50

# Check pod status
kubectl describe pod -n k8s-microservices postgres-0
```

## Connect to Database

### Using kubectl exec

```bash
# Connect to PostgreSQL
kubectl exec -it -n k8s-microservices postgres-0 -- psql -U postgres -d microservices_db

# Run SQL commands
kubectl exec -it -n k8s-microservices postgres-0 -- psql -U postgres -d microservices_db -c "SELECT version();"
```

### Using Port Forward

```bash
# Forward local port to database
kubectl port-forward -n k8s-microservices svc/postgres 5432:5432

# Then connect using any PostgreSQL client
# psql -h localhost -U postgres -d microservices_db
```

## Connection String for Services

Services can connect to the database using:

- **Host**: `postgres` (service name)
- **Port**: `5432`
- **Database**: `microservices_db`
- **Username**: `postgres`
- **Password**: `postgres123`

**Connection String Format:**
```
postgresql://postgres:postgres123@postgres:5432/microservices_db
```

## Environment Variables for Services

Add these to your service ConfigMaps or Deployments:

```yaml
env:
- name: DATABASE_HOST
  value: postgres
- name: DATABASE_PORT
  value: "5432"
- name: DATABASE_NAME
  value: microservices_db
- name: DATABASE_USER
  valueFrom:
    secretKeyRef:
      name: postgres-secret
      key: POSTGRES_USER
- name: DATABASE_PASSWORD
  valueFrom:
    secretKeyRef:
      name: postgres-secret
      key: POSTGRES_PASSWORD
```

## Troubleshooting

### Pod Not Starting

```bash
# Check pod events
kubectl describe pod -n k8s-microservices postgres-0

# Check logs
kubectl logs -n k8s-microservices postgres-0
```

### PVC Not Created

```bash
# Check PVC status
kubectl get pvc -n k8s-microservices

# Check storage class
kubectl get storageclass
```

### Database Connection Issues

```bash
# Test connectivity from a pod
kubectl run -it --rm debug --image=postgres:15-alpine --restart=Never -n k8s-microservices -- psql -h postgres -U postgres -d microservices_db
```

## Cleanup

```bash
# Delete StatefulSet (pods will be terminated)
kubectl delete statefulset -n k8s-microservices postgres

# Delete Service
kubectl delete svc -n k8s-microservices postgres

# Delete Secret
kubectl delete secret -n k8s-microservices postgres-secret

# Delete PVCs (this will delete the data!)
kubectl delete pvc -n k8s-microservices postgres-storage-postgres-0
```

## Next Steps

1. Update User Service to connect to PostgreSQL
2. Update Product Service to connect to PostgreSQL
3. Create database tables/schema
4. Add database migration jobs


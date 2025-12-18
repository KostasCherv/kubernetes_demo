# Deployment Scripts

Scripts to manage the Kubernetes microservices demo environment.

## Scripts Overview

### 🚀 `deploy-all.sh`
**Complete deployment script** - Deploys the entire stack from scratch.

**What it does:**
1. Checks prerequisites (kubectl, helm, docker)
2. Creates namespace
3. Deploys infrastructure (database, RBAC, Network Policies, ResourceQuota, CronJobs)
4. Builds all Docker images
5. Installs services with Helm
6. Deploys Ingress
7. Waits for pods to be ready

**Usage:**
```bash
./scripts/deploy-all.sh
```

**Prerequisites:**
- kubectl configured and connected to cluster
- Helm 3.x installed
- Docker running
- Ingress Controller installed (nginx)

---

### 🗑️ `cleanup-all.sh`
**Complete cleanup script** - Removes all Kubernetes resources and Docker images by default.

**What it does:**
1. Uninstalls all Helm releases
2. Deletes all resources in namespace
3. Deletes the namespace
4. Removes Docker images (by default)

**Usage:**
```bash
# Clean up everything including Docker images (default)
./scripts/cleanup-all.sh

# Skip Docker image deletion
./scripts/cleanup-all.sh --skip-images

# Skip confirmation prompt
./scripts/cleanup-all.sh --force

# Skip images and confirmation
./scripts/cleanup-all.sh --skip-images --force
```

**⚠️ Warning:** This will delete **everything** including the database, all data, and Docker images!

---

### 🔨 `build-images.sh`
**Build all Docker images** for all microservices.

**What it does:**
- Builds Docker images for: auth-service, user-service, product-service, api-gateway, frontend
- Tags images as `latest`
- Optionally pushes to registry

**Usage:**
```bash
# Build all images
./scripts/build-images.sh

# Build and push to registry
./scripts/build-images.sh --push
```

**Prerequisites:**
- Docker running
- Dockerfiles exist in each service directory

---

### 🏥 `check-health.sh`
**Health check script** - Verifies all services are running and accessible.

**What it does:**
1. Checks pod status for all services
2. Verifies database connectivity
3. Tests service endpoints (API Gateway, Frontend)
4. Checks for failed/pending pods
5. Reports HPA and CronJob status

**Usage:**
```bash
./scripts/check-health.sh
```

**Exit codes:**
- `0` - All health checks passed
- `1` - Some health checks failed

---

### 📊 `show-status.sh`
**Status overview** - Displays comprehensive status of all resources.

**What it shows:**
- Helm releases
- Pods, Services, Deployments, StatefulSets
- HPAs, Ingress, CronJobs, Jobs
- PVCs, ResourceQuotas, Network Policies
- Service Accounts
- Pod status summary
- Access information

**Usage:**
```bash
./scripts/show-status.sh
```

---

## Quick Reference

### First Time Setup
```bash
# Deploy everything
./scripts/deploy-all.sh

# Check status
./scripts/show-status.sh

# Verify health
./scripts/check-health.sh
```

### Daily Development
```bash
# Rebuild and redeploy services
./scripts/build-images.sh
./scripts/install-helm-charts.sh  # or use deploy-all.sh

# Check what's running
./scripts/show-status.sh
```

### Cleanup
```bash
# Remove everything including Docker images (with confirmation)
./scripts/cleanup-all.sh

# Remove everything but keep Docker images
./scripts/cleanup-all.sh --skip-images
```

## Other Scripts

### `install-helm-charts.sh`
Installs all services using Helm charts (assumes infrastructure is already deployed).

**Usage:**
```bash
./scripts/install-helm-charts.sh
```

### `cleanup-for-helm.sh`
Removes old YAML-managed resources before installing with Helm (keeps infrastructure).

**Usage:**
```bash
./scripts/cleanup-for-helm.sh
```

### `create-test-user.sh`
Creates a test user in the PostgreSQL database with credentials (testuser/testpass123).

**What it does:**
- Checks if test user exists
- Creates user if it doesn't exist, or updates password if it does
- Grants all necessary privileges on the database

**Usage:**
```bash
./scripts/create-test-user.sh
```

**Test User Credentials:**
- Username: `testuser`
- Password: `testpass123`
- Database: `microservices_db`

**After running, you can connect:**
```bash
# Port forward first
kubectl port-forward -n k8s-microservices svc/postgres 5432:5432

# Then connect
psql -h localhost -U testuser -d microservices_db
```

## Troubleshooting

### Script fails with "command not found"
Make sure scripts are executable:
```bash
chmod +x scripts/*.sh
```

### Docker build fails
- Check Docker is running: `docker info`
- Verify Dockerfiles exist in service directories
- Check for syntax errors in Dockerfiles

### Kubernetes connection fails
- Verify kubectl is configured: `kubectl cluster-info`
- Check you're connected to the right cluster: `kubectl config current-context`

### Helm installation fails
- Check Helm is installed: `helm version`
- Verify namespace exists: `kubectl get namespace k8s-microservices`
- Check for existing releases: `helm list -n k8s-microservices`

### Health checks fail
- Check pod status: `kubectl get pods -n k8s-microservices`
- View pod logs: `kubectl logs -n k8s-microservices <pod-name>`
- Check events: `kubectl get events -n k8s-microservices --sort-by='.lastTimestamp'`

## Script Dependencies

All scripts require:
- `bash` (tested on macOS/Linux)
- `kubectl` configured
- Access to Kubernetes cluster

Specific scripts also require:
- `deploy-all.sh`: Helm, Docker
- `build-images.sh`: Docker
- `install-helm-charts.sh`: Helm
- `check-health.sh`: `curl` (for endpoint checks)


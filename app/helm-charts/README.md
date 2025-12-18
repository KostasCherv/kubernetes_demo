# Helm Charts

Helm charts for deploying all microservices to Kubernetes.

## Overview

This directory contains Helm charts for:
- **auth-service**: Authentication service with JWT
- **user-service**: User management service
- **product-service**: Product catalog service
- **api-gateway**: API Gateway routing service
- **frontend**: Next.js frontend application

## Prerequisites

- Kubernetes cluster running
- Helm 3.x installed
- Docker images built and available
- PostgreSQL database deployed (see `../database/README.md`)

## Quick Start

### Install All Services

```bash
# Install auth-service
helm install auth-service ./auth-service -n k8s-microservices

# Install user-service
helm install user-service ./user-service -n k8s-microservices

# Install product-service
helm install product-service ./product-service -n k8s-microservices

# Install api-gateway
helm install api-gateway ./api-gateway -n k8s-microservices

# Install frontend
helm install frontend ./frontend -n k8s-microservices
```

### Install with Custom Values

```bash
# Create custom values file
cat > custom-values.yaml <<EOF
replicaCount: 3
image:
  tag: v1.0.0
resources:
  requests:
    memory: "256Mi"
    cpu: "256m"
EOF

# Install with custom values
helm install auth-service ./auth-service -f custom-values.yaml -n k8s-microservices
```

## Chart Structure

Each chart follows the standard Helm structure:

```
service-name/
├── Chart.yaml          # Chart metadata
├── values.yaml         # Default configuration values
└── templates/          # Kubernetes resource templates
    ├── _helpers.tpl    # Template helpers
    ├── deployment.yaml
    ├── service.yaml
    ├── configmap.yaml
    └── hpa.yaml        # Horizontal Pod Autoscaler (if enabled)
```

## Configuration

### Common Values

All charts support these common configuration options:

- `replicaCount`: Number of pod replicas
- `image.repository`: Docker image repository
- `image.tag`: Docker image tag
- `image.pullPolicy`: Image pull policy
- `resources`: CPU and memory requests/limits
- `autoscaling.enabled`: Enable/disable HPA
- `healthProbes`: Liveness and readiness probe configuration

### Service-Specific Values

#### Auth Service
- `config.jwtSecret`: JWT signing secret
- `config.databaseHost`: Database hostname
- `databaseSecret`: Database credentials secret reference

#### API Gateway
- `config.authServiceHost`: Auth service URL
- `config.userServiceHost`: User service URL
- `config.productServiceHost`: Product service URL

#### Frontend
- `config.apiUrl`: API Gateway URL (empty for Ingress)

## Upgrading

```bash
# Upgrade a service
helm upgrade auth-service ./auth-service -n k8s-microservices

# Upgrade with new values
helm upgrade auth-service ./auth-service -f new-values.yaml -n k8s-microservices
```

## Uninstalling

```bash
# Uninstall a service
helm uninstall auth-service -n k8s-microservices

# Uninstall all services
helm uninstall auth-service user-service product-service api-gateway frontend -n k8s-microservices
```

## Listing Releases

```bash
# List all Helm releases
helm list -n k8s-microservices

# Get release status
helm status auth-service -n k8s-microservices

# Get release values
helm get values auth-service -n k8s-microservices
```

## Testing

### Dry Run

```bash
# Test template rendering without installing
helm install auth-service ./auth-service --dry-run --debug -n k8s-microservices
```

### Validate Chart

```bash
# Lint chart
helm lint ./auth-service

# Validate all charts
for chart in */; do helm lint "$chart"; done
```

## Rollback

```bash
# List release history
helm history auth-service -n k8s-microservices

# Rollback to previous version
helm rollback auth-service -n k8s-microservices

# Rollback to specific revision
helm rollback auth-service 2 -n k8s-microservices
```

## Best Practices

1. **Use Values Files**: Store environment-specific values in separate files
2. **Version Control**: Keep values files in version control
3. **Test First**: Always use `--dry-run` before installing
4. **Monitor**: Check pod status after installation
5. **Backup**: Export values before major upgrades

## Troubleshooting

### Chart Installation Fails

```bash
# Check chart syntax
helm lint ./auth-service

# Debug template rendering
helm template auth-service ./auth-service --debug
```

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n k8s-microservices -l app.kubernetes.io/name=auth-service

# View pod logs
kubectl logs -n k8s-microservices -l app.kubernetes.io/name=auth-service
```

### Values Not Applied

```bash
# Verify values are correct
helm get values auth-service -n k8s-microservices

# Check rendered templates
helm get manifest auth-service -n k8s-microservices
```

## References

- [Helm Documentation](https://helm.sh/docs/)
- [Helm Best Practices](https://helm.sh/docs/chart_best_practices/)


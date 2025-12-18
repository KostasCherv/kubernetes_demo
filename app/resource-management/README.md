# Resource Management

Resource Management ensures fair resource allocation and prevents resource exhaustion in the namespace.

## Overview

Resource Management consists of two main components:
- **ResourceQuota**: Sets total resource limits for the namespace
- **LimitRange**: Sets default and min/max constraints for containers

## Components

### ResourceQuota (`resource-quotas.yaml`)

Defines the maximum resources that can be consumed in the namespace:

- **CPU**: 4 cores requests, 6 cores limits
- **Memory**: 4GB requests, 6GB limits
- **Pods**: Maximum 30 pods
- **Storage**: 10GB total
- **PVCs**: Maximum 5 persistent volume claims

### LimitRange (`limit-ranges.yaml`)

Sets default and constraint values for containers:

**Defaults** (applied when not specified):
- CPU: 128m request, 500m limit
- Memory: 128Mi request, 512Mi limit

**Minimum Constraints**:
- CPU: 50m
- Memory: 64Mi

**Maximum Constraints**:
- CPU: 2 cores
- Memory: 2GB

## Deployment

```bash
# Apply ResourceQuota and LimitRange
kubectl apply -f app/resource-management/

# Check ResourceQuota
kubectl get resourcequota -n k8s-microservices

# Check LimitRange
kubectl get limitrange -n k8s-microservices

# Describe ResourceQuota
kubectl describe resourcequota k8s-microservices-quota -n k8s-microservices

# Describe LimitRange
kubectl describe limitrange k8s-microservices-limits -n k8s-microservices
```

## Verification

### Check Resource Usage

```bash
# View current resource usage
kubectl describe resourcequota k8s-microservices-quota -n k8s-microservices

# Check pod resource requests/limits
kubectl get pods -n k8s-microservices -o custom-columns=NAME:.metadata.name,CPU-REQ:.spec.containers[*].resources.requests.cpu,MEM-REQ:.spec.containers[*].resources.requests.memory
```

### Verify All Deployments Have Resources

All deployments in this namespace have resource requests/limits configured:
- ✅ auth-service: 128Mi memory, 128m CPU
- ✅ user-service: 128Mi memory, 128m CPU
- ✅ product-service: 128Mi memory, 128m CPU
- ✅ api-gateway: 128Mi memory, 128m CPU
- ✅ frontend: 256Mi-512Mi memory, 250m-500m CPU
- ✅ postgres: 256Mi-512Mi memory, 250m-500m CPU

## Key Concepts

### ResourceQuota
- **Purpose**: Prevent resource exhaustion at namespace level
- **Scope**: Applies to all resources in the namespace
- **Enforcement**: Blocks creation of resources that exceed quota

### LimitRange
- **Purpose**: Set defaults and constraints for containers
- **Scope**: Applies to containers in the namespace
- **Enforcement**: Automatically applies defaults if not specified

### Resource Requests vs Limits
- **Requests**: Guaranteed resources (scheduling requirement)
- **Limits**: Maximum resources (hard cap)

## Benefits

1. **Resource Protection**: Prevents one service from consuming all resources
2. **Fair Allocation**: Ensures resources are distributed fairly
3. **Cost Control**: Limits resource consumption
4. **Predictability**: Default values ensure consistent resource allocation

## Troubleshooting

### Pod Cannot Be Created - ResourceQuota Exceeded
- **Error**: `exceeded quota: k8s-microservices-quota`
- **Fix**: Reduce resource requests or increase ResourceQuota limits

### Container Fails - LimitRange Violation
- **Error**: `exceeded maximum memory limit`
- **Fix**: Adjust container resource limits to comply with LimitRange constraints

### Check Current Usage
```bash
kubectl describe resourcequota k8s-microservices-quota -n k8s-microservices
```

## References

- [Kubernetes ResourceQuota](https://kubernetes.io/docs/concepts/policy/resource-quotas/)
- [Kubernetes LimitRange](https://kubernetes.io/docs/concepts/policy/limit-range/)


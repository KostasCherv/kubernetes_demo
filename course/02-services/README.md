# Grade Submission with Services

This section introduces **Kubernetes Services** to enable pod-to-pod communication and external access.

## What's Different from Section 01?

| Section 01 | Section 02 |
|------------|------------|
| Multi-container pods (app + health-checker) | Single-container pods |
| Direct pod access via port-forward | Service-based access |
| No networking abstraction | Services provide stable endpoints |
| Manual port-forwarding required | NodePort for external access |

## Architecture

```
External Access
      │
      ▼
┌─────────────────────────────────────────┐
│  NodePort Service (32000)               │
│  grade-submission-portal                │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│  grade-submission-portal Pod             │
│  ┌───────────────────────────────────┐  │
│  │ grade-submission-portal            │  │
│  │ Port: 5001                         │  │
│  │ Env: GRADE_SERVICE_HOST=          │  │
│  │       grade-submission-api         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
      │
      │ (via service name)
      ▼
┌─────────────────────────────────────────┐
│  ClusterIP Service                      │
│  grade-submission-api                   │
│  Port: 3000                             │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│  grade-submission-api Pod               │
│  ┌───────────────────────────────────┐  │
│  │ grade-submission-api               │  │
│  │ Port: 3000                         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Key Concepts

- **ClusterIP Service**: Internal service for pod-to-pod communication (API service)
- **NodePort Service**: Exposes service externally on a static node port (Portal service on 32000)
- **Service Discovery**: Pods access services by name (e.g., `grade-submission-api`)
- **Label Selectors**: Services route traffic to pods matching their selector labels

## Quick Commands

```bash
# Apply all resources
kubectl apply -f .

# Access portal externally (no port-forward needed!)
# Open browser: http://localhost:32000

# View services
kubectl get services

# Get service details
kubectl describe service grade-submission-api
kubectl describe service grade-submission-portal
```


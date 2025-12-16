# Grade Submission with Health Probes

This section introduces **Liveness and Readiness Probes** to monitor container health and ensure proper traffic routing.

## What's Different from Section 05?

| Section 05 | Section 06 |
|------------|------------|
| No health monitoring | Liveness and readiness probes configured |
| Manual health checks | Automatic container health monitoring |
| No automatic restarts | Unhealthy containers automatically restarted |
| Traffic to all pods | Traffic only to ready pods |
| Stateful image | Stateless image (back to stateless) |

## Architecture

```
Namespace: grade-submission
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  External Access                                          │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  NodePort Service (32000)               │            │
│  │  grade-submission-portal                │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  Portal Deployment                      │            │
│  │  ┌───────────────────────────────────┐  │            │
│  │  │ Portal Pod                        │  │            │
│  │  │ Liveness: /healthz                │  │            │
│  │  │ Readiness: /readyz                │  │            │
│  │  └───────────────────────────────────┘  │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       │ (via service name)                                │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  ClusterIP Service                      │            │
│  │  grade-submission-api                   │            │
│  │  (routes only to ready pods)             │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  API Deployment (replicas: 2)          │            │
│  │  ┌──────────┐ ┌──────────┐              │            │
│  │  │ API Pod  │ │ API Pod  │              │            │
│  │  │ Liveness:│ │ Liveness:│              │            │
│  │  │ /healthz │ │ /healthz │              │            │
│  │  │ Ready:   │ │ Ready:   │              │            │
│  │  │ /readyz  │ │ /readyz  │              │            │
│  │  └──────────┘ └──────────┘              │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Key Concepts

- **Liveness Probe**: Checks if container is running. If unhealthy, Kubernetes restarts the container.
- **Readiness Probe**: Checks if container is ready to serve traffic. If not ready, Kubernetes removes it from service endpoints.
- **Initial Delay**: Time to wait before first probe (critical for liveness, less so for readiness).
- **Period**: Frequency of probe checks (e.g., every 5 seconds).

## Probe Configuration

### API Deployment
- **Liveness**: `/healthz` on port 3000, initial delay 15s, period 5s
- **Readiness**: `/readyz` on port 3000, initial delay 10s, period 5s

### Portal Deployment
- **Liveness**: `/healthz` on port 5001, initial delay 15s, period 5s
- **Readiness**: `/readyz` on port 5001, period 5s (no initial delay)

## Benefits

- **Automatic Recovery**: Unhealthy containers are restarted automatically
- **Traffic Management**: Services only route traffic to ready pods
- **Zero-Downtime Updates**: Readiness probes ensure new pods are ready before receiving traffic
- **Early Detection**: Problems are detected and addressed before users are affected

## Quick Commands

```bash
# Apply all resources
kubectl apply -f .

# Check pod health status
kubectl get pods -n grade-submission

# View pod events (including probe failures)
kubectl describe pod <pod-name> -n grade-submission

# Monitor pod status during updates
kubectl get pods -n grade-submission -w

# Check probe endpoints manually
kubectl exec -it <pod-name> -n grade-submission -- curl http://localhost:3000/healthz
kubectl exec -it <pod-name> -n grade-submission -- curl http://localhost:3000/readyz
```


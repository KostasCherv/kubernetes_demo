# Grade Submission with Deployments

This section introduces **Kubernetes Deployments** to manage pods declaratively with automatic scaling and self-healing capabilities.

## What's Different from Section 03?

| Section 03 | Section 04 |
|------------|------------|
| Direct Pod management | Deployment-managed pods |
| Manual pod creation | Declarative pod management |
| No automatic recovery | Self-healing pods |
| Single pod instances | Multiple replicas (API: 3, Portal: 1) |
| Static configuration | Dynamic pod lifecycle |

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
│  │  Portal Deployment (replicas: 1)        │            │
│  │  ┌───────────────────────────────────┐  │            │
│  │  │ Portal Pod                        │  │            │
│  │  │ Port: 5001                        │  │            │
│  │  └───────────────────────────────────┘  │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       │ (via service name)                                │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  ClusterIP Service                      │            │
│  │  grade-submission-api                   │            │
│  │  Port: 3000                             │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  API Deployment (replicas: 3)           │            │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐│            │
│  │  │ API Pod  │ │ API Pod  │ │ API Pod  ││            │
│  │  │ Port:3000│ │ Port:3000│ │ Port:3000││            │
│  │  └──────────┘ └──────────┘ └──────────┘│            │
│  └─────────────────────────────────────────┘            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Key Concepts

- **Deployment**: Declaratively manages pods with desired replica count and pod template
- **ReplicaSet**: Ensures the specified number of pod replicas are running (created automatically by Deployment)
- **Self-healing**: Automatically replaces failed or terminated pods
- **Scalability**: Easily adjust replica count to scale applications

## Quick Commands

```bash
# Apply all resources
kubectl apply -f .

# View deployments
kubectl get deployments -n grade-submission

# View pods managed by deployments
kubectl get pods -n grade-submission

# Scale deployment
kubectl scale deployment grade-submission-api --replicas=5 -n grade-submission

# View deployment status
kubectl describe deployment grade-submission-api -n grade-submission
```


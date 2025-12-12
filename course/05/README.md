# Grade Submission with Rolling Updates

This section introduces **Rolling Update Strategy** for Deployments, enabling zero-downtime updates and easy rollbacks.

## What's Different from Section 04?

| Section 04 | Section 05 |
|------------|------------|
| Default update strategy | Explicit RollingUpdate strategy |
| No update control parameters | `maxUnavailable` and `maxSurge` configured |
| Stateless image | Stateful image (for demonstration) |
| 3 API replicas | 2 API replicas |
| Basic deployment | Deployment with update strategy |

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
│  │  └───────────────────────────────────┘  │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       │ (via service name)                                │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  ClusterIP Service                      │            │
│  │  grade-submission-api                   │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  API Deployment (replicas: 2)           │            │
│  │  RollingUpdate Strategy:                 │            │
│  │  - maxUnavailable: 50%                  │            │
│  │  - maxSurge: 1                           │            │
│  │  ┌──────────┐ ┌──────────┐              │            │
│  │  │ API Pod  │ │ API Pod  │              │            │
│  │  │ (v1/v2)  │ │ (v1/v2)  │              │            │
│  │  └──────────┘ └──────────┘              │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Key Concepts

- **Rolling Update**: Gradually replaces old pods with new ones, ensuring zero downtime
- **maxUnavailable**: Maximum pods that can be unavailable during update (50% in this example)
- **maxSurge**: Maximum extra pods that can be created during update (1 in this example)
- **Rollback**: Easy reversion to previous version using `kubectl rollout undo`

## Rolling Update Process

1. **Update image** in Deployment spec
2. **Deployment Controller** creates new ReplicaSet for new version
3. **Gradual replacement**: New pods created while old pods terminated
4. **Service** automatically routes traffic to available pods
5. **Old ReplicaSet** preserved for easy rollback

## Quick Commands

```bash
# Apply all resources
kubectl apply -f .

# Update deployment (trigger rolling update)
kubectl set image deployment/grade-submission-api \
  grade-submission-api=rslim087/kubernetes-course-grade-submission-api:new-version \
  -n grade-submission

# Monitor rolling update
kubectl rollout status deployment/grade-submission-api -n grade-submission

# View rollout history
kubectl rollout history deployment/grade-submission-api -n grade-submission

# Rollback to previous version
kubectl rollout undo deployment/grade-submission-api -n grade-submission

# View pods during update
kubectl get pods -n grade-submission -w
```


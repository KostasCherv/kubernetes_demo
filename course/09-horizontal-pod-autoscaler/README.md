# Grade Submission with Horizontal Pod Autoscaler

This section introduces **Horizontal Pod Autoscaler (HPA)** to automatically scale deployments based on CPU utilization.

## What's Different from Section 08?

| Section 08 | Section 09 |
|------------|------------|
| Fixed replica count | Automatic scaling with HPA |
| Manual scaling required | Automatic scaling based on metrics |
| Static resource allocation | Dynamic resource allocation |
| No autoscaling | HPA scales portal (1-10 replicas) |
| Manual load management | Automatic load-based scaling |

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
│  │  Horizontal Pod Autoscaler (HPA)        │            │
│  │  - Target: grade-submission-portal      │            │
│  │  - Min Replicas: 1                      │            │
│  │  - Max Replicas: 10                     │            │
│  │  - Target CPU: 50%                      │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       │ (monitors & scales)                               │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  Portal Deployment                     │            │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │            │
│  │  │ Portal   │ │ Portal   │ │ Portal   │  │            │
│  │  │ Pod      │ │ Pod      │ │ Pod      │  │            │
│  │  │ (1-10)   │ │ (1-10)   │ │ (1-10)   │  │            │
│  │  └──────────┘ └──────────┘ └──────────┘  │            │
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
│  │  API Deployment (replicas: 2)          │            │
│  │  ┌──────────┐ ┌──────────┐              │            │
│  │  │ API Pod  │ │ API Pod  │              │            │
│  │  └──────────┘ └──────────┘              │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       │ (MongoDB connection)                             │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  MongoDB StatefulSet (replicas: 1)        │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Key Concepts

- **Horizontal Pod Autoscaler (HPA)**: Automatically scales the number of pods based on observed metrics
- **CPU Utilization**: Primary metric used for scaling decisions (target: 50%)
- **Min/Max Replicas**: Scaling boundaries (1-10 for portal)
- **Control Loop**: HPA periodically checks metrics and adjusts replicas
- **Metrics Server**: Required component to collect CPU/memory metrics

## HPA Configuration

### Portal HPA

- **Target Deployment**: `grade-submission-portal`
- **Min Replicas**: 1
- **Max Replicas**: 10
- **Metric**: CPU utilization
- **Target**: 50% average utilization

### How It Works

1. **HPA monitors** CPU utilization of portal pods
2. **If CPU > 50%**: HPA increases replicas (up to 10)
3. **If CPU < 50%**: HPA decreases replicas (down to 1)
4. **Scaling happens** automatically based on load

## Requirements

- **Resource Requests**: Deployment must have CPU requests defined
- **Metrics Server**: Cluster must have metrics-server installed
- **API Version**: Use `autoscaling/v2` for HPA (supports multiple metrics)

## Benefits

- **Automatic Scaling**: Responds to traffic changes automatically
- **Cost Optimization**: Scales down during low traffic periods
- **Performance**: Ensures adequate resources during peak loads
- **Efficiency**: Optimal resource utilization based on actual demand
- **No Manual Intervention**: Self-managing based on metrics

## Quick Commands

```bash
# Apply all resources
kubectl apply -f .

# View HPA
kubectl get hpa -n grade-submission

# View HPA details
kubectl describe hpa grade-submission-portal-hpa -n grade-submission

# Watch HPA in action
kubectl get hpa -n grade-submission -w

# View current replica count
kubectl get deployment grade-submission-portal -n grade-submission

# Check metrics (requires metrics-server)
kubectl top pods -n grade-submission

# Manually scale deployment (HPA will adjust if needed)
kubectl scale deployment grade-submission-portal --replicas=5 -n grade-submission

# View HPA events
kubectl describe hpa grade-submission-portal-hpa -n grade-submission | grep Events -A 10
```

## Testing HPA

To test autoscaling:

1. **Generate load** on the portal service
2. **Monitor HPA**: `kubectl get hpa -n grade-submission -w`
3. **Watch pods scale**: `kubectl get pods -n grade-submission -w`
4. **Check metrics**: `kubectl top pods -n grade-submission`

The HPA should automatically scale up pods as CPU utilization increases.


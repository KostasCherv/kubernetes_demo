# Grade Submission with StatefulSets

This section introduces **StatefulSets** for managing stateful applications (MongoDB) with persistent storage using Persistent Volume Claims (PVCs).

## What's Different from Section 06?

| Section 06 | Section 07 |
|------------|------------|
| Stateless application only | Stateful MongoDB database added |
| No persistent storage | MongoDB with persistent storage (1Gi) |
| Deployments only | StatefulSet for MongoDB |
| No database connection | API connects to MongoDB |
| Stateless API image | Stateful API image (stateless-v3) |

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
│  │  API Deployment (replicas: 2)            │            │
│  │  ┌──────────┐ ┌──────────┐              │            │
│  │  │ API Pod  │ │ API Pod  │              │            │
│  │  │          │ │          │              │            │
│  │  └──────────┘ └──────────┘              │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       │ (MongoDB connection)                              │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  ClusterIP Service                      │            │
│  │  mongodb                                │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  MongoDB StatefulSet (replicas: 1)       │            │
│  │  ┌───────────────────────────────────┐  │            │
│  │  │ MongoDB Pod (mongodb-0)           │  │            │
│  │  │ Port: 27017                       │  │            │
│  │  │                                    │  │            │
│  │  │ Persistent Storage:               │  │            │
│  │  │ - PVC: mongodb-persistent-storage │  │            │
│  │  │ - Size: 1Gi                        │  │            │
│  │  │ - Mount: /data/db                 │  │            │
│  │  └───────────────────────────────────┘  │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Key Concepts

- **StatefulSet**: Manages stateful applications with stable pod identity and ordered deployment
- **Persistent Volume Claim (PVC)**: Request for storage that gets automatically provisioned
- **Volume Claim Template**: Automatically creates a PVC for each StatefulSet pod
- **Persistent Volume (PV)**: Actual storage resource that fulfills the PVC
- **Headless Service**: Required for StatefulSets to provide stable network identity

## Storage Configuration

### MongoDB StatefulSet
- **Replicas**: 1
- **Storage**: 1Gi via Volume Claim Template
- **Access Mode**: ReadWriteOnce
- **Mount Path**: `/data/db`
- **Service**: Headless service for stable DNS

### API Configuration
- **MongoDB Connection**: Via environment variables
  - `MONGODB_HOST`: mongodb
  - `MONGODB_PORT`: 27017
  - `MONGODB_USER`: admin
  - `MONGODB_PASSWORD`: password123

## Benefits

- **Data Persistence**: MongoDB data survives pod restarts and deletions
- **Stable Identity**: Pods have predictable names (mongodb-0, mongodb-1, etc.)
- **Ordered Operations**: Scaling and updates happen in a controlled order
- **Automatic Storage**: PVCs are created automatically for each pod

## Quick Commands

```bash
# Apply all resources
kubectl apply -f .

# View StatefulSet
kubectl get statefulset -n grade-submission

# View PVCs (Persistent Volume Claims)
kubectl get pvc -n grade-submission

# View PVs (Persistent Volumes)
kubectl get pv

# Check MongoDB pod
kubectl get pods -n grade-submission -l app.kubernetes.io/instance=mongodb

# Connect to MongoDB
kubectl exec -it mongodb-0 -n grade-submission -- mongosh -u admin -p password123

# View storage details
kubectl describe pvc mongodb-persistent-storage-mongodb-0 -n grade-submission
```


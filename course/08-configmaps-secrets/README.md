# Grade Submission with ConfigMaps and Secrets

This section introduces **ConfigMaps and Secrets** to externalize configuration and manage sensitive data separately from application code.

## What's Different from Section 07?

| Section 07 | Section 08 |
|------------|------------|
| Hardcoded environment variables | ConfigMaps for non-sensitive config |
| Plain text passwords in YAML | Secrets for sensitive data (base64 encoded) |
| Configuration in deployment files | Externalized configuration resources |
| Flat file structure | Organized subdirectories (mongodb/, api/, portal/) |
| Direct env values | `envFrom` with configMapRef and secretRef |

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
│  │  Portal Deployment                     │            │
│  │  ┌───────────────────────────────────┐  │            │
│  │  │ Portal Pod                        │  │            │
│  │  │ ConfigMap:                       │  │            │
│  │  │ - GRADE_SERVICE_HOST             │  │            │
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
│  │  API Deployment                        │            │
│  │  ┌──────────┐ ┌──────────┐              │            │
│  │  │ API Pod  │ │ API Pod  │              │            │
│  │  │          │ │          │              │            │
│  │  │ ConfigMap:                        │  │            │
│  │  │ - MONGODB_HOST                    │  │            │
│  │  │ - MONGODB_PORT                    │  │            │
│  │  │                                    │  │            │
│  │  │ Secret:                           │  │            │
│  │  │ - MONGODB_USER                    │  │            │
│  │  │ - MONGODB_PASSWORD                │  │            │
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
│  │  MongoDB StatefulSet                    │            │
│  │  ┌───────────────────────────────────┐  │            │
│  │  │ MongoDB Pod                       │  │            │
│  │  │ Secret:                           │  │            │
│  │  │ - MONGO_INITDB_ROOT_USERNAME      │  │            │
│  │  │ - MONGO_INITDB_ROOT_PASSWORD      │  │            │
│  │  └───────────────────────────────────┘  │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Key Concepts

- **ConfigMap**: Stores non-confidential configuration data (e.g., hostnames, ports, feature flags)
- **Secret**: Stores sensitive data like passwords and tokens (base64 encoded, not encrypted)
- **envFrom**: Loads all key-value pairs from ConfigMap/Secret as environment variables
- **Separation of Concerns**: Configuration and secrets are externalized from application code

## Resource Organization

Resources are organized into subdirectories:

```
course/08/
├── mongodb/
│   ├── mongodb-secret.yaml
│   ├── mongodb-service.yaml
│   └── mongodb-statefulset.yaml
├── grade-submission-api/
│   ├── grade-submission-api-config.yaml (ConfigMap)
│   ├── grade-submission-api-secret.yaml (Secret)
│   ├── grade-submission-api-deployment.yaml
│   └── grade-submission-api-service.yaml
└── grade-submission-portal/
    ├── grade-submission-portal-config.yaml (ConfigMap)
    ├── grade-submission-portal-deployment.yaml
    └── grade-submission-portal-service.yaml
```

## Configuration Details

### API ConfigMap
- `MONGODB_HOST`: mongodb
- `MONGODB_PORT`: 27017

### API Secret (base64 encoded)
- `MONGODB_USER`: admin
- `MONGODB_PASSWORD`: password123

### Portal ConfigMap
- `GRADE_SERVICE_HOST`: grade-submission-api

### MongoDB Secret (base64 encoded)
- `MONGO_INITDB_ROOT_USERNAME`: admin
- `MONGO_INITDB_ROOT_PASSWORD`: password123

## Security Note

⚠️ **Secrets are base64 encoded, NOT encrypted.** Additional security measures (RBAC, encryption at rest, external secret managers) should be implemented for production.

## Benefits

- **Configuration Management**: Update config without rebuilding containers
- **Security**: Sensitive data stored separately (though base64 is not encryption)
- **Reusability**: Same ConfigMap/Secret can be used by multiple pods
- **Portability**: Easy to adapt for different environments
- **Organization**: Better structure with subdirectories

## Quick Commands

```bash
# Apply all resources
kubectl apply -f .

# View ConfigMaps
kubectl get configmaps -n grade-submission

# View Secrets (values are base64 encoded)
kubectl get secrets -n grade-submission

# View ConfigMap details
kubectl describe configmap grade-submission-api-config -n grade-submission

# View Secret details (values shown as base64)
kubectl describe secret grade-submission-api-secret -n grade-submission

# Decode a secret value
echo 'YWRtaW4=' | base64 -d  # outputs: admin

# Update ConfigMap
kubectl edit configmap grade-submission-api-config -n grade-submission

# View environment variables in pod
kubectl exec <pod-name> -n grade-submission -- env | grep MONGODB
```


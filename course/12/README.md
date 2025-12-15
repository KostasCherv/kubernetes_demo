# Grade Submission with Helm Repositories

This section introduces **Helm Repositories** to deploy complex software (MongoDB) using public Helm charts from Bitnami, replacing custom YAML configurations.

## What's Different from Section 11?

| Section 11 | Section 12 |
|------------|------------|
| Custom MongoDB YAML files | MongoDB from Bitnami Helm chart |
| Manual MongoDB configuration | Bitnami chart with values.yaml overrides |
| MongoDB secrets in YAML | MongoDB managed by Helm chart |
| Custom StatefulSet | Bitnami StatefulSet configuration |
| API uses separate env vars | API uses MongoDB URI connection string |
| API image: stateless-v3 | API image: stateless-v4 |

## Architecture

```
Namespace: grade-submission
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  Helm Charts                                              │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ API Chart         │  │ Portal Chart      │           │
│  │ (Custom)          │  │ (Custom)          │           │
│  └──────────────────┘  └──────────────────┘           │
│                                                           │
│  ┌──────────────────┐                                    │
│  │ MongoDB Chart     │                                    │
│  │ (Bitnami)         │                                    │
│  │ - values.yaml     │                                    │
│  │   overrides       │                                    │
│  └──────────────────┘                                    │
│       │                                                   │
│       │ (helm install from repo)                          │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  Ingress Controller                   │            │
│  │  grade-submission-portal-ingress       │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  Portal Deployment (replicas: 1)        │            │
│  │  Portal Service (ClusterIP)             │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       │ (via service name)                               │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  API Deployment (replicas: 2)         │            │
│  │  API Service (ClusterIP)              │            │
│  │  MongoDB URI:                         │            │
│  │  mongodb://mongodb.mongodb...         │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       │ (MongoDB connection via URI)                     │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  MongoDB StatefulSet                   │            │
│  │  (Deployed via Bitnami chart)          │            │
│  │  - Image: mongo:6.0.4-jammy            │            │
│  │  - Auth: disabled                      │            │
│  │  - Persistent storage                  │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Key Concepts

- **Helm Repository**: Collection of Helm charts (e.g., Bitnami)
- **Public Charts**: Pre-built, tested charts for common software
- **Values Override**: Custom values.yaml that overrides chart defaults
- **Chart Installation**: Install charts from repositories with `helm install`
- **MongoDB URI**: Connection string format instead of separate env vars

## MongoDB Configuration

### Bitnami Chart Values Override

The `mongodb/values.yaml` file contains only the values that differ from Bitnami defaults:

```yaml
useStatefulSet: true

auth:
  enabled: false

image:
  registry: docker.io
  repository: mongo
  tag: 6.0.4-jammy

persistence:
  mountPath: /data/db
```

**Key Settings:**
- **StatefulSet**: Uses StatefulSet for stateful deployment
- **Auth Disabled**: No authentication (development setup)
- **Image**: MongoDB 6.0.4 on Ubuntu Jammy
- **Persistence**: Data stored at `/data/db`

## API Configuration Changes

### MongoDB Connection

The API now uses a **MongoDB URI** instead of separate environment variables:

```yaml
secrets:
  MONGODB_URI: 'mongodb://mongodb.mongodb.svc.cluster.local:27017'
```

**Connection Format:**
- `mongodb://` - Protocol
- `mongodb.mongodb.svc.cluster.local` - Service DNS name
- `27017` - Port

## Benefits

- **Production-Ready**: Bitnami charts are tested and maintained
- **Regular Updates**: Security patches and updates available
- **Best Practices**: Follows Kubernetes best practices
- **Time Savings**: No need to create custom MongoDB configuration
- **Documentation**: Comprehensive Bitnami documentation
- **Community Support**: Large community using these charts

## Quick Commands

```bash
# Add Bitnami Helm repository
helm repo add bitnami https://charts.bitnami.com/bitnami

# Update Helm repositories
helm repo update

# Search for MongoDB chart
helm search repo bitnami/mongodb

# View default values
helm show values bitnami/mongodb

# Install MongoDB with custom values
helm install mongodb bitnami/mongodb \
  --namespace grade-submission \
  --create-namespace \
  -f mongodb/values.yaml

# Install API chart
helm install grade-submission-api ./grade-submission-api \
  --namespace grade-submission

# Install Portal chart
helm install grade-submission-portal ./grade-submission-portal \
  --namespace grade-submission

# List all releases
helm list -n grade-submission

# View MongoDB release status
helm status mongodb -n grade-submission

# Upgrade MongoDB
helm upgrade mongodb bitnami/mongodb \
  --namespace grade-submission \
  -f mongodb/values.yaml

# Uninstall MongoDB
helm uninstall mongodb -n grade-submission
```

## Deployment Workflow

1. **Add Helm Repository**: `helm repo add bitnami https://charts.bitnami.com/bitnami`
2. **Update Repositories**: `helm repo update`
3. **Research Chart**: Review Bitnami MongoDB chart documentation
4. **Create Values File**: Create `mongodb/values.yaml` with custom settings
5. **Install MongoDB**: `helm install mongodb bitnami/mongodb -f mongodb/values.yaml`
6. **Install API Chart**: `helm install grade-submission-api ./grade-submission-api`
7. **Install Portal Chart**: `helm install grade-submission-portal ./grade-submission-portal`
8. **Verify**: Check pods and services are running

## Important Notes

- **Research First**: Always read chart documentation before deploying
- **Values Override**: Only specify values that differ from defaults
- **Security**: Bitnami charts have security best practices built-in
- **Updates**: Regularly update charts for security patches
- **Production**: Review and adjust values for production environments


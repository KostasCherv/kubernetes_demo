# Grade Submission with Kubernetes Operators

This section introduces **Kubernetes Operators** to manage MongoDB using the MongoDB Community Operator, replacing Helm charts with operator-managed custom resources.

## What's Different from Section 12?

| Section 12 | Section 13 |
|------------|------------|
| MongoDB via Bitnami Helm chart | MongoDB via MongoDB Community Operator |
| Helm values.yaml configuration | Custom Resource (MongoDBCommunity) |
| Helm install/upgrade commands | kubectl apply for custom resources |
| Chart-based deployment | Operator-based deployment |
| values.yaml overrides | Custom Resource spec configuration |
| No authentication | SCRAM authentication enabled |
| Single namespace | MongoDB in separate namespace |

## Architecture

```
Namespace: mongodb
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  MongoDB Community Operator                             │
│  - Watches for MongoDBCommunity resources              │
│  - Creates and manages MongoDB resources               │
│  - Handles lifecycle and state management              │
└─────────────────────────────────────────────────────────┘
      │
      │ (watches custom resources)
      ▼
┌─────────────────────────────────────────────────────────┐
│  MongoDBCommunity Custom Resource                       │
│  - name: mongodb-grade-submission                      │
│  - version: 6.0.5                                      │
│  - members: 1 (ReplicaSet)                             │
│  - authentication: SCRAM                                │
│  - users: user with readWrite on grades DB            │
└─────────────────────────────────────────────────────────┘
      │
      │ (operator creates)
      ▼
┌─────────────────────────────────────────────────────────┐
│  Standard Kubernetes Resources                          │
│  - StatefulSet (MongoDB pods)                           │
│  - Services (mongodb-grade-submission)                  │
│  - Secrets (SCRAM credentials)                         │
│  - ConfigMaps                                           │
└─────────────────────────────────────────────────────────┘
      │
      │ (MongoDB connection)
      ▼
┌─────────────────────────────────────────────────────────┐
│  Namespace: grade-submission                            │
│  ┌─────────────────────────────────────────┐          │
│  │  API Deployment                          │          │
│  │  - Connects to MongoDB via operator      │          │
│  │  - Uses SCRAM authentication              │          │
│  └─────────────────────────────────────────┘          │
│  ┌─────────────────────────────────────────┐          │
│  │  Portal Deployment                      │          │
│  └─────────────────────────────────────────┘          │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Key Concepts

- **Kubernetes Operator**: Extends Kubernetes to manage complex applications
- **Custom Resource**: Application-specific resource (MongoDBCommunity)
- **Custom Resource Definition (CRD)**: Defines the schema for custom resources
- **Custom Controller**: Watches custom resources and manages standard Kubernetes resources
- **Operator Pattern**: Automation of operational knowledge

## MongoDB Configuration

### MongoDBCommunity Custom Resource

```yaml
apiVersion: mongodbcommunity.mongodb.com/v1
kind: MongoDBCommunity
metadata:
  name: mongodb-grade-submission
  namespace: mongodb
spec:
  members: 1
  type: ReplicaSet
  version: "6.0.5"
  security:
    authentication:
      modes: ["SCRAM"]
  users:
    - name: user
      db: grades
      passwordSecretRef:
        name: mongodb-user-password
      roles: 
        - name: readWrite
          db: grades
```

**Key Settings:**
- **Members**: 1 (single MongoDB instance)
- **Type**: ReplicaSet (can scale to multiple members)
- **Version**: MongoDB 6.0.5
- **Authentication**: SCRAM enabled
- **Users**: Custom user with readWrite access to `grades` database

### User Password Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-user-password
  namespace: mongodb
type: Opaque
data:
  password: 'cGFzc3dvcmQxMjM='  # base64: password123
```

## Benefits

- **Abstraction**: Work with MongoDB-specific resources instead of low-level Kubernetes primitives
- **Automation**: Operator handles complex MongoDB lifecycle management
- **Best Practices**: Operator implements MongoDB best practices
- **Self-Healing**: Operator can automatically recover from failures
- **Simplified Management**: Manage MongoDB like any other Kubernetes resource
- **Advanced Features**: Access to MongoDB-specific features (ReplicaSets, authentication, etc.)

## Quick Commands

```bash
# Install MongoDB Community Operator (if not already installed)
helm repo add mongodb https://mongodb.github.io/helm-charts
helm repo update
helm install community-operator mongodb/community-operator \
  --namespace mongodb \
  --create-namespace

# Create MongoDB namespace
kubectl create namespace mongodb

# Apply MongoDB custom resource
kubectl apply -f mongodb/mongodb-grade-submission.yaml

# Apply user password secret
kubectl apply -f mongodb/mongodb-user-password.yaml

# View custom resources
kubectl get mongodbcommunity -n mongodb

# View MongoDB details
kubectl describe mongodbcommunity mongodb-grade-submission -n mongodb

# View standard Kubernetes resources created by operator
kubectl get pods -n mongodb
kubectl get services -n mongodb
kubectl get statefulsets -n mongodb

# View operator logs
kubectl logs -n mongodb -l control-plane=mongodb-kubernetes-operator

# Update MongoDB configuration
kubectl edit mongodbcommunity mongodb-grade-submission -n mongodb

# Delete MongoDB instance
kubectl delete mongodbcommunity mongodb-grade-submission -n mongodb
```

## Deployment Workflow

1. **Install Operator**: Install MongoDB Community Operator via Helm
2. **Create Namespace**: Create `mongodb` namespace
3. **Create Secret**: Apply user password secret
4. **Create Custom Resource**: Apply MongoDBCommunity custom resource
5. **Operator Creates Resources**: Operator automatically creates StatefulSet, Services, etc.
6. **Monitor**: Check custom resource and standard Kubernetes resources
7. **Connect**: API connects to MongoDB using operator-managed service

## Important Notes

- **Operator Required**: The MongoDB Community Operator must be installed first
- **Namespace**: MongoDB is deployed in a separate `mongodb` namespace
- **Authentication**: SCRAM authentication is enabled (more secure than section 12)
- **Custom Resources**: Use `kubectl get mongodbcommunity` to view MongoDB instances
- **Operator Logs**: Check operator logs if issues occur
- **Updates**: Update operator regularly for new features and fixes

## Comparison: Helm vs Operator

| Aspect | Helm Chart | Operator |
|--------|-----------|----------|
| **Deployment** | `helm install` | `kubectl apply` |
| **Configuration** | values.yaml | Custom Resource spec |
| **Lifecycle** | Static deployment | Dynamic, self-managing |
| **Updates** | `helm upgrade` | `kubectl apply` (operator handles) |
| **Complexity** | Simpler for basic use | Better for complex scenarios |
| **Automation** | Manual management | Automated lifecycle |


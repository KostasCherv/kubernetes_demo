# Grade Submission with Namespaces

This section introduces **Kubernetes Namespaces** to organize and isolate resources logically within a cluster.

## What's Different from Section 02?

| Section 02 | Section 03 |
|------------|------------|
| Resources in `default` namespace | Resources in `grade-submission` namespace |
| No namespace specified in YAML | `namespace: grade-submission` in metadata |
| Cluster-wide resource visibility | Namespace-scoped resource isolation |
| Simple resource organization | Logical grouping of related resources |

## Understanding Namespaces

While a Kubernetes cluster is physically distributed across multiple machines (master and worker nodes), developers interact with it as a **single entity partitioned into logical divisions called namespaces**. These namespaces group together closely related resources.

### Key Benefits

- **Organization**: Group related resources together (e.g., all grade-submission components)
- **Isolation**: Resources in different namespaces are logically separated
- **Resource Management**: Apply quotas and policies at the namespace level
- **Multi-tenancy**: Support multiple teams/projects on the same cluster

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
│  │  grade-submission-portal Pod             │            │
│  │  ┌───────────────────────────────────┐    │            │
│  │  │ grade-submission-portal            │    │            │
│  │  │ Port: 5001                         │    │            │
│  │  │ Env: GRADE_SERVICE_HOST=          │    │            │
│  │  │       grade-submission-api         │    │            │
│  │  └───────────────────────────────────┘    │            │
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
│  │  grade-submission-api Pod               │            │
│  │  ┌───────────────────────────────────┐  │            │
│  │  │ grade-submission-api               │  │            │
│  │  │ Port: 3000                         │  │            │
│  │  └───────────────────────────────────┘  │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Namespace Configuration

All resources in this section specify the namespace in their metadata:

```yaml
metadata:
  name: grade-submission-api
  namespace: grade-submission
```

### Deployment Methods

**Command-line approach:**
```bash
kubectl apply -f my-deployment.yaml -n grade-submission
```

**YAML configuration:**
```yaml
metadata:
  namespace: grade-submission
```

If no namespace is specified, Kubernetes places resources in the `default` namespace.

## Best Practices

- **Use namespaces** to organize and isolate your workloads logically
- **Be aware** of the namespace you're working in to avoid unintended interactions
- **Collaborate** with cluster administrators to understand namespace-level policies or quotas

## Quick Commands

```bash
# Apply all resources (namespace specified in YAML)
kubectl apply -f .

# View resources in namespace
kubectl get pods -n grade-submission
kubectl get services -n grade-submission

# Access portal externally (same as section 02)
# Open browser: http://localhost:32000

# Switch context to namespace
kubectl config set-context --current --namespace=grade-submission
```

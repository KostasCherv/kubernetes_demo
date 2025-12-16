# Grade Submission with Helm Charts

This section introduces **Helm Charts** to package and manage Kubernetes applications, replacing individual YAML files with templated, versioned charts.

## What's Different from Section 10?

| Section 10 | Section 11 |
|------------|------------|
| Individual YAML files | Helm charts with templates |
| Hardcoded values in YAML | Configuration in values.yaml |
| Manual resource management | Helm-managed releases |
| No versioning | Chart versioning (1.0.0, 1.0.1) |
| Direct kubectl apply | helm install/upgrade commands |
| Flat file structure | Chart directory structure |

## Architecture

```
Namespace: grade-submission
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  Helm Charts                                              │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ API Chart         │  │ Portal Chart      │           │
│  │ (v1.0.1)          │  │ (v1.0.0)          │           │
│  │                   │  │                   │           │
│  │ Chart.yaml        │  │ Chart.yaml        │           │
│  │ values.yaml       │  │ values.yaml       │           │
│  │ templates/        │  │ templates/        │           │
│  │  - deployment     │  │  - deployment     │           │
│  │  - service        │  │  - service        │           │
│  │  - config         │  │  - config         │           │
│  │  - secret         │  │  - ingress        │           │
│  └──────────────────┘  └──────────────────┘           │
│       │                          │                       │
│       │ (helm install)           │ (helm install)        │
│       ▼                          ▼                       │
│  ┌─────────────────────────────────────────┐            │
│  │  Ingress Controller                     │            │
│  │  grade-submission-portal-ingress         │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  Portal Deployment (replicas: 1)        │            │
│  │  Portal Service (ClusterIP)              │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       │ (via service name)                                │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  API Deployment (replicas: 2)           │            │
│  │  API Service (ClusterIP)                 │            │
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

## Chart Structure

### API Chart

```
grade-submission-api/
├── Chart.yaml                    # Chart metadata
├── values.yaml                   # Configuration values
├── grade-submission-api-1.0.1.tgz  # Packaged chart
└── templates/
    ├── grade-submission-api-deployment.yaml
    ├── grade-submission-api-service.yaml
    ├── grade-submission-api-config.yaml
    └── grade-submission-api-secret.yaml
```

### Portal Chart

```
grade-submission-portal/
├── Chart.yaml                    # Chart metadata
├── values.yaml                   # Configuration values
├── grade-submission-portal-1.0.0.tgz  # Packaged chart
└── templates/
    ├── grade-submission-portal-deployment.yaml
    ├── grade-submission-portal-service.yaml
    ├── grade-submission-portal-config.yaml
    └── grade-submission-portal-ingress.yaml
```

## Key Concepts

- **Helm Chart**: Package containing templates and values for Kubernetes resources
- **Chart.yaml**: Metadata about the chart (name, version, description)
- **values.yaml**: Default configuration values (can be overridden)
- **Templates**: Kubernetes manifests with Helm templating syntax (`{{ .Values... }}`)
- **Release**: An instance of a chart deployed to Kubernetes
- **Helm Templating**: Go template syntax to inject values into manifests

## Values Structure

### API Chart Values

```yaml
microservice:
  name: grade-submission-api
  namespace: grade-submission
  replicas: 2

workload:
  image: rslim087/kubernetes-course-grade-submission-api:stateless-v3
  port: 3000
  resources:
    memory: "128Mi"
    cpu: "128m"
```

### Portal Chart Values

```yaml
microservice:
  name: grade-submission-portal
  namespace: grade-submission
  replicas: 1

workload:
  image: rslim087/kubernetes-course-grade-submission-portal
  port: 5001
```

## Benefits

- **Packaging**: Bundle all related resources together
- **Versioning**: Track chart versions (1.0.0, 1.0.1)
- **Reusability**: Share charts across teams/projects
- **Configuration Management**: Centralize config in values.yaml
- **Simplified Deployment**: Single command to deploy
- **Easy Upgrades**: `helm upgrade` to update applications
- **Rollback Support**: Easy rollback to previous versions
- **Template Reusability**: Same templates, different values

## Quick Commands

```bash
# Preview rendered templates
helm template grade-submission-api ./grade-submission-api

# Install API chart
helm install grade-submission-api ./grade-submission-api

# Install Portal chart
helm install grade-submission-portal ./grade-submission-portal

# List all releases
helm list -n grade-submission

# View release status
helm status grade-submission-api -n grade-submission

# Upgrade a release
helm upgrade grade-submission-api ./grade-submission-api

# Upgrade with custom values
helm upgrade grade-submission-api ./grade-submission-api -f custom-values.yaml

# View release history
helm history grade-submission-api -n grade-submission

# Rollback to previous version
helm rollback grade-submission-api -n grade-submission

# Uninstall a release
helm uninstall grade-submission-api -n grade-submission

# Package a chart
helm package ./grade-submission-api

# Install from packaged chart
helm install grade-submission-api ./grade-submission-api-1.0.1.tgz
```

## Deployment Workflow

1. **Create/Modify** chart files (Chart.yaml, values.yaml, templates/)
2. **Preview** rendered manifests: `helm template <chart>`
3. **Install** the chart: `helm install <release-name> <chart-path>`
4. **Monitor** deployment: `kubectl get pods -n grade-submission`
5. **Upgrade** if needed: `helm upgrade <release-name> <chart-path>`
6. **Rollback** if issues: `helm rollback <release-name>`

## MongoDB

MongoDB resources remain as plain YAML files (not yet converted to Helm chart) in the `mongodb/` directory.



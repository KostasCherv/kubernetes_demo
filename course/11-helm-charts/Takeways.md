# Key Takeaways

## Helm Overview

**Helm** is a package manager for Kubernetes that simplifies the deployment and management of applications. By using **Helm Charts**, you can manage complex Kubernetes applications as a single unit, simplifying deployment, upgrades, and rollbacks.

This approach provides a more organized and maintainable way to handle Kubernetes resources compared to managing individual loose resources.

---

## Directory Structure

A typical Helm Chart has the following structure:

```
mychart/
  ├── Chart.yaml          # Contains chart information
  ├── values.yaml         # Default configuration values
  └── templates/          # Directory for template files
      ├── deployment.yaml
      ├── service.yaml
      └── ingress.yaml
```

### Chart Components

- **`Chart.yaml`**: Metadata about the chart (name, version, dependencies)
- **`values.yaml`**: Default configuration values that can be overridden
- **`templates/`**: Directory containing Kubernetes manifest templates with Helm templating syntax

---

## Helm Templating

Helm uses Go templates to inject values into Kubernetes manifests:

### Example Template

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.microservice.name }}
  namespace: {{ .Values.microservice.namespace }}
spec:
  replicas: {{ .Values.microservice.replicas }}
```

### Values Reference

Values are referenced using `{{ .Values.<path> }}`:
- `{{ .Values.microservice.name }}` → Accesses `microservice.name` from values.yaml
- `{{ .Values.workload.image }}` → Accesses `workload.image` from values.yaml
- `{{ .Values.env.MONGODB_HOST }}` → Accesses environment variables

---

## Common Helm Commands

### Install a Chart

```bash
helm install [RELEASE_NAME] [CHART]
```

Example:
```bash
helm install grade-submission-api ./grade-submission-api
```

### Uninstall a Release

```bash
helm uninstall [RELEASE_NAME]
```

### Upgrade a Release

```bash
helm upgrade [RELEASE_NAME] [CHART]
```

### List All Releases

```bash
helm list
```

### View Rendered Templates

Preview the manifest templates with values applied:

```bash
helm template [CHART]
```

### Package a Chart

Package a chart into a versioned archive file:

```bash
helm package [CHART_PATH]
```

This creates a `.tgz` file that can be shared or stored in a Helm repository.

---

## Deployment Workflow

1. **Create or modify** chart files in the chart directory
2. **Use `helm template`** to preview the rendered Kubernetes manifests
3. **Install or upgrade** the release using `helm install` or `helm upgrade`
4. **Monitor** the deployment using `kubectl` commands
5. **If needed**, use `helm uninstall` to remove the release and all associated resources

---

## Benefits

- **Packaging**: Bundle all related Kubernetes resources together
- **Versioning**: Track chart versions and manage releases
- **Reusability**: Share charts across teams and projects
- **Configuration Management**: Centralize configuration in values.yaml
- **Simplified Deployment**: Single command to deploy complex applications
- **Easy Upgrades**: Update applications with `helm upgrade`
- **Rollback Support**: Easy rollback to previous versions
- **Template Reusability**: Use same templates with different values

---

## Chart vs Release

- **Chart**: The package containing templates and values (the blueprint)
- **Release**: An instance of a chart deployed to Kubernetes (the running application)

You can deploy the same chart multiple times as different releases with different configurations.

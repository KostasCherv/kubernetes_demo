# Key Takeaways

## Namespaces Overview

While a Kubernetes cluster is physically distributed across multiple machines (master and worker nodes), developers interact with it as a **single entity partitioned into logical divisions called namespaces**. These namespaces group together closely related resources.

---

## Deploying to a Specific Namespace

### Command-line Approach

```bash
kubectl apply -f my-deployment.yaml -n my-namespace
```

### YAML Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: my-namespace
```

---

## Default Namespace

If no namespace is specified, Kubernetes will place the resource in the **`default`** namespace.

---

## Best Practices for Developers

- **Use namespaces** to organize and isolate your workloads logically
- **Be aware** of the namespace you're working in to avoid unintended interactions between resources
- **Collaborate** with your cluster administrators to understand any namespace-level policies or quotas that may affect your deployments

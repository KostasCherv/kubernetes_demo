# Key Takeaways

## Helm as Package Manager

Helm serves as a powerful **package manager for Kubernetes**, simplifying the deployment of complex software like:

- Elasticsearch
- MongoDB
- MySQL
- Redis
- And many more...

By leveraging Helm repositories, you can deploy production-ready, well-tested configurations with minimal effort.

---

## Process of Deploying Complex Software with Helm

### 1. Add Helm Repository

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
```

This adds the **Bitnami repository**, which hosts many popular software charts.

### 2. Update Helm Repositories

```bash
helm repo update
```

Ensures you have the **latest chart versions** available.

### 3. Search for Available Charts

```bash
helm search repo bitnami/mongodb
```

Find the chart you need and check its **available versions**.

### 4. Research Default Values

- **Examine** the default `values.yaml` file in the chart's documentation
- **Understand** which values you need to modify for your use case
- **Review** the chart's README and documentation

### 5. Create Custom Values File

Create a file, e.g., `my-mongodb-values.yaml`, with your custom settings:

```yaml
useStatefulSet: true
auth:
  enabled: false
image:
  tag: 6.0.4-jammy
persistence:
  mountPath: /data/db
```

**Important:** Only include values that differ from the defaults.

### 6. Install the Chart with Custom Values

```bash
helm install my-mongodb bitnami/mongodb -f my-mongodb-values.yaml
```

This command installs MongoDB, applying your custom configuration on top of the default values. **Only the fields specified in `my-mongodb-values.yaml` will override the corresponding default values**, while all other settings remain at their default.

---

## Research Before Deployment

**Thoroughly read** the chart's documentation, and understand the implications of changing default values:

- **Security considerations**: Default security settings
- **Resource requirements**: CPU and memory needs
- **Storage requirements**: Persistent volume needs
- **Configuration options**: Available customization options
- **Best practices**: Recommended settings for production

---

## Benefits of Using Helm Repositories

- **Production-Ready**: Charts are tested and maintained by experts
- **Regular Updates**: Security patches and updates available
- **Best Practices**: Follows Kubernetes best practices
- **Documentation**: Comprehensive documentation and examples
- **Community Support**: Large community using and contributing
- **Time Savings**: No need to create custom configurations from scratch

---

## Conclusion

By leveraging Helm as a package manager, you can significantly **simplify the deployment and management** of complex software in Kubernetes environments, allowing you to focus more on your application and less on the intricacies of Kubernetes configurations.

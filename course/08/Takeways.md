# Key Takeaways

## ConfigMaps

**ConfigMaps** in Kubernetes are used to store **non-confidential configuration data** in key-value pairs, allowing you to:

- **Decouple configuration** from pod specifications
- **Make applications more portable**
- **Update configuration** without rebuilding your application container

ConfigMaps can be consumed by pods as environment variables, files, or command-line arguments.

### Example ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: game-config
data:
  player_initial_lives: "3"
  ui_properties_file_name: "user-interface.properties"
```

---

## Secrets

**Secrets** in Kubernetes are similar to ConfigMaps but are specifically designed for **sensitive information** like:

- Passwords
- OAuth tokens
- SSH keys
- API keys
- Database credentials

Secrets can be consumed by pods similarly to ConfigMaps. They use the `data` field, which expects **base64 encoded values**. This encoding is particularly useful for handling special characters often found in sensitive data.

### Example Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
type: Opaque
data:
  username: YWRtaW4=  # base64 encoded 'admin'
  password: dDBwLVMzY3JzdA==  # base64 encoded 't0p-S3cr3t'
```

---

## Important Security Note

⚠️ **While Secrets are base64 encoded, they are NOT encrypted.**

Base64 encoding is a form of encoding, not encryption. Anyone with access to the Secret can easily decode it.

**Additional security measures** are typically implemented to protect sensitive data in clusters:

- External secret management systems (e.g., HashiCorp Vault, AWS Secrets Manager)
- Kubernetes Encryption Providers (encryption at rest)
- RBAC (Role-Based Access Control) to limit who can access Secrets
- Network policies to restrict access

However, specific approaches vary based on organizational needs and security policies.

---

## Using ConfigMaps and Secrets in Pods

### Environment Variables from ConfigMap/Secret

```yaml
envFrom:
  - configMapRef:
      name: my-config
  - secretRef:
      name: my-secret
```

This loads all key-value pairs from the ConfigMap and Secret as environment variables.

### Individual Environment Variables

```yaml
env:
  - name: MONGODB_HOST
    valueFrom:
      configMapKeyRef:
        name: my-config
        key: mongodb-host
  - name: MONGODB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: my-secret
        key: mongodb-password
```

---

## Benefits

- **Separation of Concerns**: Configuration and secrets are separate from application code
- **Reusability**: Same ConfigMap/Secret can be used by multiple pods
- **Security**: Sensitive data is stored separately (though base64 encoding is not encryption)
- **Flexibility**: Update configuration without rebuilding containers
- **Portability**: Easy to adapt applications for different environments

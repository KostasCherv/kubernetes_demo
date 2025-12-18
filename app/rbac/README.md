# RBAC (Role-Based Access Control) Configuration

This directory contains RBAC resources implementing the **principle of least privilege** for all microservices.

## Overview

RBAC ensures each service only has the minimum permissions required to function, enhancing security and following Kubernetes best practices.

## Components

### 1. ServiceAccounts (`serviceaccounts/`)
Identity for pods. Each service has its own ServiceAccount:
- `auth-service-sa`
- `user-service-sa`
- `product-service-sa`
- `api-gateway-sa`
- `frontend-sa`

### 2. Roles (`roles/`)
Namespace-scoped permissions defining what each service can access:
- **Auth/User/Product Services**: Read their own ConfigMap + `postgres-secret`
- **API Gateway**: Read its own ConfigMap only
- **Frontend**: Read its own ConfigMap only

### 3. RoleBindings (`rolebindings/`)
Connects Roles to ServiceAccounts, granting permissions.

## Permissions Matrix

| Service | ConfigMap Access | Secret Access |
|---------|-----------------|---------------|
| auth-service | `auth-service-config` (get) | `postgres-secret` (get) |
| user-service | `user-service-config` (get) | `postgres-secret` (get) |
| product-service | `product-service-config` (get) | `postgres-secret` (get) |
| api-gateway | `api-gateway-config` (get) | None |
| frontend | `frontend-config` (get) | None |

## Deployment

### Apply All RBAC Resources

```bash
# Apply ServiceAccounts
kubectl apply -f app/rbac/serviceaccounts/

# Apply Roles
kubectl apply -f app/rbac/roles/

# Apply RoleBindings
kubectl apply -f app/rbac/rolebindings/

```

### Verify RBAC Setup

```bash
# Check ServiceAccounts
kubectl get serviceaccounts -n k8s-microservices

# Check Roles
kubectl get roles -n k8s-microservices

# Check RoleBindings
kubectl get rolebindings -n k8s-microservices

# Verify a pod is using the correct ServiceAccount
kubectl get pod <pod-name> -n k8s-microservices -o jsonpath='{.spec.serviceAccountName}'
```

### Update Deployments

After applying RBAC resources, update deployments to use ServiceAccounts:

```bash
# Apply updated deployments
kubectl apply -f app/services/auth-service/k8s/deployment.yaml
kubectl apply -f app/services/user-service/k8s/deployment.yaml
kubectl apply -f app/services/product-service/k8s/deployment.yaml
kubectl apply -f app/services/api-gateway/k8s/deployment.yaml
kubectl apply -f app/services/frontend/k8s/deployment.yaml
```

## Testing RBAC

### Test Permissions (Should Fail)

```bash
# Try to access a ConfigMap the service shouldn't have access to
kubectl exec -it <auth-service-pod> -n k8s-microservices -- \
  curl -k -H "Authorization: Bearer $(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
  https://kubernetes.default.svc/api/v1/namespaces/k8s-microservices/configmaps/user-service-config
```

This should fail with a `403 Forbidden` if RBAC is working correctly.

### Verify Service Can Access Its Own Resources

```bash
# Check if pod can start and access its ConfigMap (should work)
kubectl logs <pod-name> -n k8s-microservices
```

If the pod starts successfully and can read its ConfigMap/Secret, RBAC is configured correctly.

## Key Concepts

### ServiceAccount
- **Purpose**: Identity for pods
- **Scope**: Namespace-scoped
- **Default**: If not specified, pods use the `default` ServiceAccount (has broad permissions)

### Role
- **Purpose**: Defines permissions
- **Scope**: Namespace-scoped (use `ClusterRole` for cluster-wide)
- **Rules**: List of API groups, resources, and verbs (get, list, watch, create, update, delete)

### RoleBinding
- **Purpose**: Grants permissions by binding a Role to a ServiceAccount
- **Scope**: Namespace-scoped
- **Subjects**: Who gets the permissions (ServiceAccount)
- **roleRef**: What permissions (Role)

## Security Best Practices

1. **Least Privilege**: Only grant minimum required permissions
2. **Resource Names**: Use `resourceNames` to restrict access to specific resources
3. **Read-Only**: Use `get` verb instead of `list` when possible
4. **Separate ServiceAccounts**: Each service should have its own ServiceAccount
5. **No Write Permissions**: Services typically only need read access to ConfigMaps/Secrets

## Troubleshooting

### Pod Cannot Start
- **Issue**: Pod fails to start or crashes
- **Check**: Verify ServiceAccount exists and RoleBinding is correct
- **Fix**: Ensure `serviceAccountName` in deployment matches the ServiceAccount name

### Permission Denied Errors
- **Issue**: Service cannot access ConfigMap/Secret
- **Check**: Verify Role has correct `resourceNames` and `verbs`
- **Fix**: Ensure RoleBinding connects the correct Role to ServiceAccount

### ServiceAccount Not Found
- **Issue**: `ServiceAccount "xxx-sa" not found`
- **Fix**: Apply ServiceAccount before deploying pods:
  ```bash
  kubectl apply -f app/rbac/serviceaccounts/
  ```

## File Structure

```
app/rbac/
├── README.md
├── serviceaccounts/
│   ├── auth-service-sa.yaml
│   ├── user-service-sa.yaml
│   ├── product-service-sa.yaml
│   ├── api-gateway-sa.yaml
│   └── frontend-sa.yaml
├── roles/
│   ├── auth-service-role.yaml
│   ├── user-service-role.yaml
│   ├── product-service-role.yaml
│   ├── api-gateway-role.yaml
│   └── frontend-role.yaml
└── rolebindings/
    ├── auth-service-binding.yaml
    ├── user-service-binding.yaml
    ├── product-service-binding.yaml
    ├── api-gateway-binding.yaml
    └── frontend-binding.yaml
```

## References

- [Kubernetes RBAC Documentation](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
- [ServiceAccounts](https://kubernetes.io/docs/concepts/security/service-accounts/)
- [Roles and RoleBindings](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#role-and-clusterrole)


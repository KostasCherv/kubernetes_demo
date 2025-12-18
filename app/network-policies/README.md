# Network Policies

Network Policies implement network isolation and security by controlling traffic flow between pods.

## Overview

Network Policies enforce a **default deny-all** policy and only allow explicitly defined traffic patterns, following the principle of least privilege.

## Policies

### 1. Default Deny All (`default-deny.yaml`)
- **Purpose**: Blocks all ingress and egress traffic by default
- **Scope**: All pods in the namespace
- **Effect**: All pods are isolated until specific policies allow traffic

### 2. API Gateway Ingress (`allow-api-gateway-ingress.yaml`)
- **Purpose**: Allow external traffic from Ingress Controller to API Gateway
- **Target**: API Gateway
- **Port**: 3000

### 3. API Gateway Egress (`allow-api-gateway-egress.yaml`)
- **Purpose**: Allow API Gateway to reach backend services
- **Flow**: API Gateway → Auth/User/Product Services
- **Port**: 3000

### 4. Frontend Ingress (`allow-frontend-ingress.yaml`)
- **Purpose**: Allow external traffic from Ingress Controller to Frontend
- **Target**: Frontend
- **Port**: 3000

### 5. Backend Services Ingress (`allow-*-service-ingress.yaml`)
- **Purpose**: Allow API Gateway to reach backend services
- **Flow**: API Gateway → Auth/User/Product Services
- **Port**: 3000

### 6. Backend Services Egress (`allow-*-service-egress.yaml`)
- **Purpose**: Allow backend services to reach PostgreSQL
- **Flow**: Auth/User/Product Services → Database
- **Port**: 5432

### 7. Frontend Egress (`allow-frontend-egress.yaml`)
- **Purpose**: Allow frontend to reach API Gateway
- **Flow**: Frontend → API Gateway
- **Port**: 3000

### 8. Database Ingress (`allow-database.yaml`)
- **Purpose**: Allow backend services to connect to PostgreSQL
- **Flow**: Auth/User/Product Services → Database
- **Port**: 5432

## Traffic Flow

```
Internet
  ↓
Ingress Controller
  ↓
[Network Policy: allow-api-gateway-ingress / allow-frontend-ingress]
  ↓
API Gateway / Frontend
  ↓
[Network Policy: allow-api-gateway-egress / allow-frontend-egress]
  ↓
Backend Services (Auth/User/Product)
    ↓
[Network Policy: allow-*-service-egress]
    ↓
Database (PostgreSQL)
```

## Deployment

```bash
# Apply all network policies
kubectl apply -f app/network-policies/

# Check network policies
kubectl get networkpolicies -n k8s-microservices

# Describe a specific policy
kubectl describe networkpolicy default-deny-all -n k8s-microservices
```

## Verification

### Check Policies
```bash
kubectl get networkpolicies -n k8s-microservices
```

### Test Connectivity
```bash
# Test API Gateway (should work)
curl http://localhost/api/health

# Test frontend (should work)
curl http://localhost/
```

### Verify Pods Are Running
```bash
kubectl get pods -n k8s-microservices
```

## Key Concepts

### Pod Selector
- Selects which pods the policy applies to
- Uses labels: `app.kubernetes.io/name: <service-name>`

### Ingress Rules
- Control incoming traffic to pods
- Specify `from` (source) and `ports` (destination ports)

### Egress Rules
- Control outgoing traffic from pods
- Specify `to` (destination) and `ports` (destination ports)

### Default Deny
- When a Network Policy is applied, pods are isolated by default
- Only traffic explicitly allowed by policies can pass through

## Security Benefits

1. **Isolation**: Services cannot communicate unless explicitly allowed
2. **Least Privilege**: Only necessary traffic is permitted
3. **Defense in Depth**: Multiple layers of security
4. **Compliance**: Meets security requirements for production

## Troubleshooting

### Pod Cannot Connect
- **Check**: Verify Network Policy allows the connection
- **Fix**: Add appropriate ingress/egress rules

### DNS Resolution Fails
- **Check**: Ensure DNS egress rules are present (UDP/TCP port 53)
- **Fix**: Add DNS egress rules to the service's Network Policy

### Ingress Not Working
- **Check**: Verify `allow-*-ingress` policy exists for the service
- **Fix**: Ensure Ingress Controller namespace is allowed

## File Structure

```
app/network-policies/
├── README.md
├── default-deny.yaml
├── allow-api-gateway-ingress.yaml
├── allow-api-gateway-egress.yaml
├── allow-frontend-ingress.yaml
├── allow-frontend-egress.yaml
├── allow-auth-service-ingress.yaml
├── allow-auth-service-egress.yaml
├── allow-user-service-ingress.yaml
├── allow-user-service-egress.yaml
├── allow-product-service-ingress.yaml
├── allow-product-service-egress.yaml
└── allow-database.yaml
```

## References

- [Kubernetes Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
- [Network Policy Tutorial](https://kubernetes.io/docs/tasks/administer-cluster/declare-network-policy/)


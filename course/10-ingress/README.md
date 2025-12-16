# Grade Submission with Ingress

This section introduces **Ingress** for managing external access to services, replacing NodePort with a more flexible and production-ready approach.

## What's Different from Section 09?

| Section 09 | Section 10 |
|------------|------------|
| NodePort service for external access | Ingress for external access |
| Static port (32000) | Domain-based routing (future) |
| Direct node port exposure | Reverse proxy via Ingress controller |
| Portal service: NodePort | Portal service: ClusterIP |
| HPA configured | No HPA (removed) |

## Architecture

```
External Access
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│  Ingress Controller (nginx)                             │
│  - Acts as reverse proxy                                │
│  - Routes based on Ingress rules                        │
└─────────────────────────────────────────────────────────┘
      │
      │ (routes based on path: /)
      ▼
┌─────────────────────────────────────────────────────────┐
│  Ingress Resource                                       │
│  - ingressClassName: nginx                              │
│  - Path: / → grade-submission-portal:5001              │
└─────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│  ClusterIP Service                                      │
│  grade-submission-portal                                │
│  Port: 5001                                             │
└─────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────┐
│  Portal Deployment (replicas: 1)                       │
│  ┌───────────────────────────────────┐                  │
│  │ Portal Pod                        │                  │
│  │ Port: 5001                        │                  │
│  └───────────────────────────────────┘                  │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       │ (via service name)                                │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  ClusterIP Service                      │            │
│  │  grade-submission-api                   │            │
│  └─────────────────────────────────────────┘            │
│       │                                                   │
│       ▼                                                   │
│  ┌─────────────────────────────────────────┐            │
│  │  API Deployment (replicas: 2)          │            │
│  │  ┌──────────┐ ┌──────────┐              │            │
│  │  │ API Pod  │ │ API Pod  │              │            │
│  │  └──────────┘ └──────────┘              │            │
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

## Key Concepts

- **Ingress**: Kubernetes resource that defines routing rules for external access
- **Ingress Controller**: The actual reverse proxy implementation (e.g., nginx, Traefik)
- **Reverse Proxy**: Sits in front of services and forwards requests on their behalf
- **Path-Based Routing**: Route traffic based on URL paths
- **Host-Based Routing**: Route traffic based on domain names (production)

## Ingress Configuration

### Current Setup (Development)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: grade-submission-portal-ingress
  namespace: grade-submission
spec:
  ingressClassName: nginx
  rules:     
  - http:
      paths:
      - pathType: Prefix
        path: "/"    
        backend:
          service:
            name: grade-submission-portal
            port: 
              number: 5001
```

**Characteristics:**
- **Permissive**: Any host can connect
- **All paths** (`/`) route to portal service
- **Development-friendly**: Easy to test

### Production Setup (Example)

```yaml
spec:
  rules:
  - host: grades.myuniversity.com
    http:
      paths:
      - path: "/"
        pathType: Prefix
        backend:
          service:
            name: grade-submission-portal
            port: 
              number: 5001
```

**Characteristics:**
- **Restrictive**: Only specified host allowed
- **Security**: Additional layer of control
- **Production-ready**: Domain-based routing

## Service Changes

### Portal Service

Changed from **NodePort** to **ClusterIP**:
- No longer exposes static node port
- Accessible only through Ingress
- More secure and flexible

## Requirements

- **Ingress Controller**: Must have an Ingress controller installed (e.g., nginx-ingress)
- **Ingress Class**: Specified via `ingressClassName`
- **Backend Service**: Service must exist and be accessible

## Benefits

- **Single Entry Point**: One external endpoint for multiple services
- **Path-Based Routing**: Route different paths to different services
- **Host-Based Routing**: Route different domains to different services
- **SSL/TLS Termination**: Handle HTTPS at the Ingress level
- **Load Balancing**: Built-in load balancing across service endpoints
- **Better Security**: More control over incoming traffic
- **Production Ready**: Industry-standard approach for external access

## Quick Commands

```bash
# Apply all resources
kubectl apply -f .

# View Ingress
kubectl get ingress -n grade-submission

# View Ingress details
kubectl describe ingress grade-submission-portal-ingress -n grade-submission

# Check Ingress controller
kubectl get pods -n ingress-nginx  # or your ingress controller namespace

# Get Ingress external IP/address
kubectl get ingress -n grade-submission

# View Ingress logs (if using nginx-ingress)
kubectl logs -n ingress-nginx <ingress-controller-pod>

# Test Ingress (replace with your Ingress IP)
curl http://<ingress-ip>/

# Update Ingress
kubectl edit ingress grade-submission-portal-ingress -n grade-submission
```

## Accessing the Application

1. **Get Ingress IP/Address**:
   ```bash
   kubectl get ingress -n grade-submission
   ```

2. **Access via Ingress**:
   - Development: `http://<ingress-ip>/`
   - Production: `https://grades.myuniversity.com/`

3. **Verify Routing**:
   ```bash
   curl -H "Host: grades.myuniversity.com" http://<ingress-ip>/
   ```


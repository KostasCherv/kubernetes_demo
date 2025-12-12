# Key Takeaways

## Ingress Overview

The **Ingress controller** in Kubernetes acts as a **reverse proxy**, which means it sits in front of web servers and acts on their behalf to forward external HTTP requests to the appropriate internal services.

---

## How Ingress Works

The Ingress controller uses the **Ingress resource** to determine how to route traffic. Here's a step-by-step breakdown:

### 1. External Request Arrives

An external HTTP request arrives at the Ingress controller.

### 2. Ingress Resource Definition

The controller examines the Ingress resource:

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

### 3. Resource Identification

The controller identifies that this is an Ingress resource (`kind: Ingress`) in the `grade-submission` namespace.

### 4. Ingress Class

It notes that the **nginx Ingress controller** should be used (`ingressClassName: nginx`).

### 5. Rule Processing

The controller then looks at the **rules**. In this case, there's a single rule that applies to all HTTP traffic.

### 6. Path Matching

The rule specifies that all paths starting with `/` (`path: "/"`) should be directed to the `grade-submission-portal` service on port `5001`.

### 7. Request Forwarding

Based on this rule, the Ingress controller forwards the request to the specified backend service.

---

## Development vs Production Configuration

### Development Configuration (Current)

In the current configuration, the rules are quite **permissive**:

- **Any host** can connect
- **All traffic** is routed to the same service

This setup is common in development environments but may not be suitable for production.

### Production Configuration

In a production environment, after purchasing a domain, you can implement more **restrictive rules**:

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

This configuration would:
- **Only allow traffic** from the specified host (`grades.myuniversity.com`)
- **Reject requests** from other hosts
- Provide an **additional layer of security** and control over incoming traffic

---

## Key Components

- **Ingress Controller**: The reverse proxy that handles incoming traffic (e.g., nginx)
- **Ingress Resource**: Defines routing rules and backend services
- **ingressClassName**: Specifies which Ingress controller to use
- **Rules**: Define how to route traffic based on host and path
- **Backend**: The service that receives the forwarded traffic

---

## Benefits

- **Single Entry Point**: One external endpoint for multiple services
- **Path-Based Routing**: Route traffic based on URL paths
- **Host-Based Routing**: Route traffic based on domain names
- **SSL/TLS Termination**: Handle HTTPS at the Ingress level
- **Load Balancing**: Distribute traffic across service endpoints
- **Better than NodePort**: More flexible and production-ready than NodePort services

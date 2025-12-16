# Key Takeaways

## Services Overview

The **Service** primitive in Kubernetes abstracts away network complexities and provides a durable endpoint for accessing pods.

---

## NodePort Service

Allows external access to the Kubernetes network by exposing a static port on the node (range: **30000-32767**).

### Example Configuration

```yaml
apiVersion: v1
kind: Service
metadata:
  name: grade-submission-portal
spec:
  type: NodePort
  selector:
    app: grade-submission-portal
  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 30080
```

### Request Flow

1. **External request** is initiated on the node's static port (`nodePort: 30080`)
2. **Request enters** the cluster through the Service's internal port (`port: 8080`)
3. **Service acts as a proxy** by directing the request to a matching pod using a label selector
4. **Target port** (`targetPort: 8080`) ensures the request reaches the container port on the pod

> **Note**: The NodePort service is often used when prototyping, rarely in practice.

---

## ClusterIP Service

Used for **internal pod-to-pod communication** within the cluster.

### Example Configuration

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
    - port: 8080
      targetPort: 8080
```

### Request Flow

1. **Pods within the cluster** can access the service using its name (`backend-service`) and service's internal port (`port: 8080`)
2. **Service acts as a proxy** by directing the request to a matching pod using a label selector
3. **Target port** (`targetPort: 8080`) ensures the request reaches the container port on the pod

---

## Service Components

- **`port`**: The port exposed by the service (internal cluster port)
- **`targetPort`**: The port on the pod/container that receives traffic
- **`nodePort`**: The external port exposed on each node (NodePort services only)
- **`selector`**: Labels used to match pods that the service routes to

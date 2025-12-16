# Key Takeaways

## Kubernetes Overview

Kubernetes is a container orchestration platform that coordinates the collaboration of **Master Nodes** and **Worker Nodes**.

- **Master Nodes (Control Plane)**: Responsible for scheduling and deciding where applications run
- **Worker Nodes**: Provide the infrastructure to actually run the applications
- **Single-node cluster**: Your computer plays the role of both Master and Worker Node

---

## Containers

Containers run applications in isolation with their dependencies, making them highly portable.

---

## Pods

In Kubernetes, **pods are the smallest deployable units** and encapsulate application containers.

---

## Pod Configuration

### Metadata

- **Name**: Uniquely identifies the pod
- **Labels**: Categorize pods into distinct groups for flexible querying

### Runtime Requirements (specified under `spec`)

- Container name
- Image source
- Port for serving requests
- Resource requirements (CPU and memory)

### Resource Best Practices

- **Memory**: Limit and request should be the same
- **CPU**: Limit should rarely be set (as per Kubernetes best practices)

---

## Multi-Container Pods

Pods can run multiple containers, enabling **sidecar patterns** where auxiliary sidecar containers can communicate with the main application container via `localhost`.

---

## Port Forwarding in Kubernetes

Port forwarding creates a temporary connection between your local machine and a pod in the cluster. It's primarily used for **debugging and testing purposes**.

### Command Structure

```bash
kubectl port-forward <pod-name> <local-port>:<pod-port>
```

### Example

```bash
kubectl port-forward mypod 8080:80
```

This forwards local port `8080` to port `80` of the pod.

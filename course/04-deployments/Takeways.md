# Key Takeaways

## Deployments Overview

A **Deployment** in Kubernetes allows us to declaratively manage a set of pods. The two key specifications in a Deployment are:

1. **Number of pod replicas** - How many pod instances to maintain
2. **Pod template** - Defining how each pod should be constructed

### Example Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: my-app
        image: my-app:v1
```

This Deployment declares our desired state: **3 replicas** of pods based on the specified template.

---

## How Deployments Work

### Behind the Scenes

1. **Deployment Controller** creates a **ReplicaSet** based on the Deployment specification
2. **ReplicaSet** is a Kubernetes resource that ensures a specified number of pod replicas are running at all times
3. **ReplicaSet Controller** watches for ReplicaSet objects and creates pods based on them
4. **ReplicaSet Controller** continuously monitors the state of the pods
5. If a pod terminates or fails, the **ReplicaSet Controller** automatically creates a new one to maintain the desired number of replicas

### Controller Responsibilities

- **Deployment Controller**: Manages the overall lifecycle of the Deployment, including updates and rollbacks
- **ReplicaSet Controller**: Handles the day-to-day management of pods

This orchestration happens **automatically**. As developers, we simply declare our desired state in the Deployment object, and Kubernetes handles the rest, ensuring our application remains running as specified.

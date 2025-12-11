# Grade Submission Pods

This directory contains Kubernetes pod definitions for the grade submission application.

## Pod Architecture

```
┌─────────────────────────────────────┐
│  grade-submission-api Pod            │
│  ┌───────────────────────────────┐  │
│  │ grade-submission-api           │  │
│  │ Port: 3000                     │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ grade-submission-api-          │  │
│  │ health-checker                │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  grade-submission-portal Pod         │
│  ┌───────────────────────────────┐  │
│  │ grade-submission-portal        │  │
│  │ Port: 5001                     │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ grade-submission-portal-       │  │
│  │ health-checker                │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Apply Pods

Apply both pods:
```bash
kubectl apply -f .
```

Apply individual pods:
```bash
kubectl apply -f grade-submission-api-pod.yaml
kubectl apply -f grade-submission-portal-pod.yaml
```

## View Pods

List all pods:
```bash
kubectl get pods
```

Get pod details:
```bash
kubectl get pod grade-submission-api
kubectl get pod grade-submission-portal
```

Describe pods:
```bash
kubectl describe pod grade-submission-api
kubectl describe pod grade-submission-portal
```

## View Logs

Get logs from API pod:
```bash
kubectl logs grade-submission-api -c grade-submission-api
kubectl logs grade-submission-api -c grade-submission-api-health-checker
```

Get logs from Portal pod:
```bash
kubectl logs grade-submission-portal -c grade-submission-portal
kubectl logs grade-submission-portal -c grade-submission-portal-health-checker
```

## Stream Logs (Follow)

Stream logs from API pod:
```bash
kubectl logs -f grade-submission-api -c grade-submission-api
kubectl logs -f grade-submission-api -c grade-submission-api-health-checker
```

Stream logs from Portal pod:
```bash
kubectl logs -f grade-submission-portal -c grade-submission-portal
kubectl logs -f grade-submission-portal -c grade-submission-portal-health-checker
```

## Port Forward

Forward API port (3000):
```bash
kubectl port-forward grade-submission-api 3000:3000
```

Forward Portal port (5001):
```bash
kubectl port-forward grade-submission-portal 5001:5001
```

## Delete Pods

Delete both pods:
```bash
kubectl delete -f .
```

Delete individual pods:
```bash
kubectl delete pod grade-submission-api
kubectl delete pod grade-submission-portal
```

## Execute Commands

Execute commands in pods:
```bash
kubectl exec -it grade-submission-api -c grade-submission-api -- /bin/sh
kubectl exec -it grade-submission-portal -c grade-submission-portal -- /bin/sh
```


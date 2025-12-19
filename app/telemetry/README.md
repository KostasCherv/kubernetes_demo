# Telemetry & Distributed Tracing

This directory contains OpenTelemetry and Jaeger configuration for distributed tracing across all microservices.

## Overview

**OpenTelemetry** is an open-source observability framework that automatically instruments your services to collect traces, metrics, and logs.

**Jaeger** is a distributed tracing system that visualizes request flows across services.

## What It Does

- **Tracks requests** across all services (Frontend → API Gateway → Backend Services)
- **Shows latency** breakdown per service
- **Visualizes service dependencies** in a service map
- **Helps debug issues** by showing complete request traces

## Architecture

```
User Request
  ↓
Frontend → API Gateway → Auth/User/Product Services → Database
  ↓
All services send traces to → Jaeger Collector
  ↓
Jaeger UI (http://localhost/jaeger)
```

## Files

- `jaeger-service.yaml` - Jaeger Service (ClusterIP)
- `jaeger-deployment.yaml` - Jaeger Deployment
- `jaeger-ingress.yaml` - Ingress to access Jaeger UI

## Quick Start

### 1. Deploy Jaeger

```bash
kubectl apply -f app/telemetry/jaeger-service.yaml
kubectl apply -f app/telemetry/jaeger-deployment.yaml
kubectl apply -f app/telemetry/jaeger-ingress.yaml
```

### 2. Verify Jaeger is Running

```bash
kubectl get pods -n k8s-microservices -l app=jaeger
kubectl get svc -n k8s-microservices jaeger
```

### 3. Access Jaeger UI

Open your browser: **http://localhost/jaeger**

### 4. View Traces

1. Go to **Search** tab
2. Select a service (e.g., `api-gateway`)
3. Click **Find Traces**
4. Click on a trace to see the full request flow

## Useful Commands

### Check Jaeger Logs

```bash
kubectl logs -n k8s-microservices -l app=jaeger
```

### Restart Jaeger

```bash
kubectl rollout restart deployment jaeger -n k8s-microservices
```

### Port Forward (Alternative Access)

```bash
kubectl port-forward -n k8s-microservices svc/jaeger 16686:16686
# Then access: http://localhost:16686
```

## How It Works

1. Each service initializes OpenTelemetry on startup (see `src/telemetry.js`)
2. OpenTelemetry automatically instruments Express, HTTP, and PostgreSQL
3. Traces are sent to Jaeger via HTTP endpoint (`http://jaeger:14268/api/traces`)
4. Jaeger stores and visualizes the traces

## Configuration

Telemetry settings are configured via ConfigMaps:

- `SERVICE_NAME` - Service identifier in traces
- `JAEGER_ENDPOINT` - Jaeger collector endpoint

## Troubleshooting

**No traces appearing?**
- Check services are sending traces: `kubectl logs <service-pod> | grep OpenTelemetry`
- Verify Jaeger is running: `kubectl get pods -l app=jaeger`
- Check network policies allow egress to Jaeger

**Jaeger UI not accessible?**
- Verify ingress: `kubectl get ingress jaeger-ingress -n k8s-microservices`
- Check ingress controller is running


# Key Takeaways

## Health Probes Overview

Kubernetes provides **liveness** and **readiness** probes to monitor container health and manage traffic routing. Together, they ensure your application remains healthy and responsive in a Kubernetes environment.

---

## Liveness Probe

The **liveness endpoint** returns a `200` status if the application is operational, or a `500` status if it's not. The liveness probe checks this endpoint and considers the app healthy only if it receives a `200` status.

**Behavior:**
- Any response other than `200`, or no response at all, triggers a **container restart**
- Use liveness probes to detect and restart unhealthy containers

### Example Configuration

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 25
  periodSeconds: 5
```

---

## Readiness Probe

The **readiness endpoint** verifies if the application has successfully connected to all components necessary for serving traffic. It returns a `200` status only when all required connections and initializations are complete, and a `500` status otherwise.

**Behavior:**
- The readiness probe uses this endpoint to determine if a container is ready to accept traffic
- If the probe receives anything other than a `200` status, or no response, it keeps the container **out of service**
- Use readiness probes to determine when a container is ready to start accepting traffic

### Example Configuration

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  periodSeconds: 5
```

---

## Initial Delay and Period

### Initial Delay

The **initial delay** sets how long to wait before the first probe runs. For example, if an app takes 20 seconds to start, set the liveness probe's `initialDelaySeconds` to at least 20 seconds. This ensures the probe only begins checking after the application has had sufficient time to initialize.

**For liveness probes:** Initial delay is critical - you don't want to restart a container that's still starting up.

**For readiness probes:** Initial delay is less critical. An unresponsive app during startup correctly indicates it's not yet ready for traffic.

### Period

The **period** determines the frequency of subsequent probes. For example, `periodSeconds: 5` means the probe runs every 5 seconds.

---

## Usage Summary

- **Liveness probes**: Detect and restart unhealthy containers
- **Readiness probes**: Determine when a container is ready to start accepting traffic
- **Together**: They ensure your application remains healthy and responsive in a Kubernetes environment

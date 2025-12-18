#!/bin/bash

# Health check script for all microservices
# Usage: ./scripts/check-health.sh

set -e

NAMESPACE="k8s-microservices"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

HEALTHY=true

echo "=== Health Check ==="
echo ""

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo -e "${RED}❌ Namespace '$NAMESPACE' does not exist${NC}"
    exit 1
fi

# Function to check pod health
check_pod_health() {
    local service_name=$1
    local label_selector="app.kubernetes.io/name=$service_name"
    
    echo -e "${BLUE}Checking $service_name...${NC}"
    
    # Check if pods exist
    PODS=$(kubectl get pods -n $NAMESPACE -l "$label_selector" --no-headers 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$PODS" -eq 0 ]; then
        echo -e "  ${RED}❌ No pods found${NC}"
        HEALTHY=false
        return
    fi
    
    # Check pod status
    READY_PODS=$(kubectl get pods -n $NAMESPACE -l "$label_selector" -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' | grep -o "True" | wc -l | tr -d ' ')
    TOTAL_PODS=$(kubectl get pods -n $NAMESPACE -l "$label_selector" --no-headers 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$READY_PODS" -eq "$TOTAL_PODS" ] && [ "$READY_PODS" -gt 0 ]; then
        echo -e "  ${GREEN}✅ Pods: $READY_PODS/$TOTAL_PODS ready${NC}"
    else
        echo -e "  ${YELLOW}⚠️  Pods: $READY_PODS/$TOTAL_PODS ready${NC}"
        HEALTHY=false
    fi
    
    # Check for restarts
    RESTARTS=$(kubectl get pods -n $NAMESPACE -l "$label_selector" -o jsonpath='{.items[*].status.containerStatuses[0].restartCount}' | awk '{sum+=$1} END {print sum+0}')
    if [ "$RESTARTS" -gt 0 ]; then
        echo -e "  ${YELLOW}⚠️  Total restarts: $RESTARTS${NC}"
    fi
}

# Function to check service endpoint
check_service_endpoint() {
    local service_name=$1
    local endpoint=$2
    local expected_status=${3:-200}
    
    echo -e "${BLUE}Checking $service_name endpoint...${NC}"
    
    # Try to get response
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" 2>/dev/null || echo "000")
    
    if [ "$RESPONSE" = "$expected_status" ]; then
        echo -e "  ${GREEN}✅ Endpoint accessible: $endpoint (HTTP $RESPONSE)${NC}"
    else
        echo -e "  ${RED}❌ Endpoint not accessible: $endpoint (HTTP $RESPONSE)${NC}"
        HEALTHY=false
    fi
}

# Check database
echo -e "${BLUE}=== Database ===${NC}"
check_pod_health "postgres"

# Check if database is accessible
DB_POD=$(kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=postgres -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$DB_POD" ]; then
    if kubectl exec -n $NAMESPACE "$DB_POD" -- pg_isready -U postgres &> /dev/null; then
        echo -e "  ${GREEN}✅ Database is ready${NC}"
    else
        echo -e "  ${RED}❌ Database is not ready${NC}"
        HEALTHY=false
    fi
fi
echo ""

# Check services
echo -e "${BLUE}=== Services ===${NC}"

SERVICES=("auth-service" "user-service" "product-service" "api-gateway" "frontend")

for service in "${SERVICES[@]}"; do
    check_pod_health "$service"
    echo ""
done

# Check service endpoints
echo -e "${BLUE}=== Service Endpoints ===${NC}"

# Check API Gateway health endpoint
INGRESS_READY=$(kubectl get ingress -n $NAMESPACE --no-headers 2>/dev/null | wc -l | tr -d ' ')
if [ "$INGRESS_READY" -gt 0 ]; then
    check_service_endpoint "API Gateway" "http://localhost/api/health" "200"
    echo ""
    
    # Check frontend
    check_service_endpoint "Frontend" "http://localhost/" "200"
    echo ""
else
    echo -e "${YELLOW}⚠️  Ingress not configured, skipping endpoint checks${NC}"
    echo ""
fi

# Check HPAs
echo -e "${BLUE}=== Autoscaling ===${NC}"
HPA_COUNT=$(kubectl get hpa -n $NAMESPACE --no-headers 2>/dev/null | wc -l | tr -d ' ')
if [ "$HPA_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ HPAs configured: $HPA_COUNT${NC}"
    kubectl get hpa -n $NAMESPACE
else
    echo -e "${YELLOW}⚠️  No HPAs found${NC}"
fi
echo ""

# Check CronJobs
echo -e "${BLUE}=== CronJobs ===${NC}"
CRONJOB_COUNT=$(kubectl get cronjobs -n $NAMESPACE --no-headers 2>/dev/null | wc -l | tr -d ' ')
if [ "$CRONJOB_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ CronJobs configured: $CRONJOB_COUNT${NC}"
    kubectl get cronjobs -n $NAMESPACE
else
    echo -e "${YELLOW}⚠️  No CronJobs found${NC}"
fi
echo ""

# Check for failed pods
echo -e "${BLUE}=== Failed Pods ===${NC}"
FAILED_PODS=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase=Failed --no-headers 2>/dev/null | wc -l | tr -d ' ')
if [ "$FAILED_PODS" -gt 0 ]; then
    echo -e "${RED}❌ Found $FAILED_PODS failed pod(s):${NC}"
    kubectl get pods -n $NAMESPACE --field-selector=status.phase=Failed
    HEALTHY=false
else
    echo -e "${GREEN}✅ No failed pods${NC}"
fi
echo ""

# Check for pending pods
echo -e "${BLUE}=== Pending Pods ===${NC}"
PENDING_PODS=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase=Pending --no-headers 2>/dev/null | wc -l | tr -d ' ')
if [ "$PENDING_PODS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $PENDING_PODS pending pod(s):${NC}"
    kubectl get pods -n $NAMESPACE --field-selector=status.phase=Pending
    HEALTHY=false
else
    echo -e "${GREEN}✅ No pending pods${NC}"
fi
echo ""

# Summary
echo "=== Summary ==="
if [ "$HEALTHY" = true ]; then
    echo -e "${GREEN}✅ All health checks passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some health checks failed${NC}"
    echo ""
    echo "💡 Troubleshooting:"
    echo "  - Check pod logs: kubectl logs -n $NAMESPACE <pod-name>"
    echo "  - Describe pod: kubectl describe pod -n $NAMESPACE <pod-name>"
    echo "  - Check events: kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp'"
    exit 1
fi


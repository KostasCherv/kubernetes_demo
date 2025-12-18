#!/bin/bash

# Show comprehensive status of all Kubernetes resources
# Usage: ./scripts/show-status.sh

set -e

NAMESPACE="k8s-microservices"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=== Kubernetes Microservices Status ==="
echo ""

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo -e "${RED}❌ Namespace '$NAMESPACE' does not exist${NC}"
    echo ""
    echo "Run './scripts/deploy-all.sh' to deploy the stack."
    exit 1
fi

echo -e "${BLUE}📦 Namespace: $NAMESPACE${NC}"
echo ""

# Helm Releases
echo -e "${BLUE}📊 Helm Releases:${NC}"
if helm list -n $NAMESPACE --short | grep -q .; then
    helm list -n $NAMESPACE
else
    echo -e "${YELLOW}  No Helm releases found${NC}"
fi
echo ""

# Pods
echo -e "${BLUE}🔄 Pods:${NC}"
kubectl get pods -n $NAMESPACE -o wide
echo ""

# Services
echo -e "${BLUE}🌐 Services:${NC}"
kubectl get svc -n $NAMESPACE
echo ""

# Deployments
echo -e "${BLUE}🚀 Deployments:${NC}"
kubectl get deployments -n $NAMESPACE
echo ""

# StatefulSets
echo -e "${BLUE}💾 StatefulSets:${NC}"
kubectl get statefulsets -n $NAMESPACE
echo ""

# HPAs
echo -e "${BLUE}📈 Horizontal Pod Autoscalers:${NC}"
kubectl get hpa -n $NAMESPACE 2>/dev/null || echo -e "${YELLOW}  No HPAs found${NC}"
echo ""

# Ingress
echo -e "${BLUE}🌍 Ingress:${NC}"
kubectl get ingress -n $NAMESPACE 2>/dev/null || echo -e "${YELLOW}  No Ingress found${NC}"
echo ""

# CronJobs
echo -e "${BLUE}⏰ CronJobs:${NC}"
kubectl get cronjobs -n $NAMESPACE 2>/dev/null || echo -e "${YELLOW}  No CronJobs found${NC}"
echo ""

# Jobs
echo -e "${BLUE}📋 Recent Jobs:${NC}"
kubectl get jobs -n $NAMESPACE 2>/dev/null | head -10 || echo -e "${YELLOW}  No Jobs found${NC}"
echo ""

# PVCs
echo -e "${BLUE}💿 Persistent Volume Claims:${NC}"
kubectl get pvc -n $NAMESPACE 2>/dev/null || echo -e "${YELLOW}  No PVCs found${NC}"
echo ""

# Resource Quotas
echo -e "${BLUE}📊 Resource Quotas:${NC}"
kubectl get resourcequota -n $NAMESPACE 2>/dev/null || echo -e "${YELLOW}  No ResourceQuotas found${NC}"
echo ""

# Network Policies
echo -e "${BLUE}🔒 Network Policies:${NC}"
kubectl get networkpolicies -n $NAMESPACE 2>/dev/null || echo -e "${YELLOW}  No Network Policies found${NC}"
echo ""

# RBAC
echo -e "${BLUE}🔐 Service Accounts:${NC}"
kubectl get serviceaccounts -n $NAMESPACE 2>/dev/null || echo -e "${YELLOW}  No ServiceAccounts found${NC}"
echo ""

# Pod Status Summary
echo -e "${BLUE}📈 Pod Status Summary:${NC}"
READY_PODS=$(kubectl get pods -n $NAMESPACE -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' | grep -o "True" | wc -l | tr -d ' ')
TOTAL_PODS=$(kubectl get pods -n $NAMESPACE --no-headers 2>/dev/null | wc -l | tr -d ' ')
RUNNING_PODS=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l | tr -d ' ')
PENDING_PODS=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase=Pending --no-headers 2>/dev/null | wc -l | tr -d ' ')
FAILED_PODS=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase=Failed --no-headers 2>/dev/null | wc -l | tr -d ' ')

if [ "$TOTAL_PODS" -gt 0 ]; then
    echo "  Total Pods: $TOTAL_PODS"
    echo -e "  Ready: ${GREEN}$READY_PODS${NC}"
    echo -e "  Running: ${GREEN}$RUNNING_PODS${NC}"
    if [ "$PENDING_PODS" -gt 0 ]; then
        echo -e "  Pending: ${YELLOW}$PENDING_PODS${NC}"
    fi
    if [ "$FAILED_PODS" -gt 0 ]; then
        echo -e "  Failed: ${RED}$FAILED_PODS${NC}"
    fi
else
    echo -e "${YELLOW}  No pods found${NC}"
fi
echo ""

# Access Information
echo -e "${BLUE}🌐 Access Information:${NC}"
INGRESS_HOST=$(kubectl get ingress -n $NAMESPACE -o jsonpath='{.items[0].spec.rules[0].host}' 2>/dev/null || echo "")
if [ -n "$INGRESS_HOST" ] && [ "$INGRESS_HOST" != "null" ]; then
    echo "  Frontend: http://$INGRESS_HOST/"
    echo "  API Gateway: http://$INGRESS_HOST/api/health"
else
    echo "  Frontend: http://localhost/ (via Ingress)"
    echo "  API Gateway: http://localhost/api/health (via Ingress)"
    echo ""
    echo "  To access services directly:"
    echo "    kubectl port-forward -n $NAMESPACE svc/frontend 3000:3000"
    echo "    kubectl port-forward -n $NAMESPACE svc/api-gateway 3000:3000"
fi
echo ""

# Quick Commands
echo -e "${BLUE}💡 Quick Commands:${NC}"
echo "  Check health:     ./scripts/check-health.sh"
echo "  View logs:       kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=<service>"
echo "  Describe pod:    kubectl describe pod -n $NAMESPACE <pod-name>"
echo "  Get events:      kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp'"


#!/bin/bash

# Deploy complete microservices stack to Kubernetes
# This script deploys: namespace, infrastructure, builds images, and installs services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

NAMESPACE="k8s-microservices"
APP_DIR="$PROJECT_ROOT/app"
CHARTS_DIR="$APP_DIR/helm-charts"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=== Deploying Complete Microservices Stack ==="
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ Error: kubectl is not installed${NC}"
    exit 1
fi

if ! command -v helm &> /dev/null; then
    echo -e "${RED}❌ Error: Helm is not installed. Please install Helm 3.x first.${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not installed${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if kubectl can connect to cluster
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Error: Cannot connect to Kubernetes cluster${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

cd "$PROJECT_ROOT"

# Step 1: Create namespace
echo "📦 Step 1/6: Creating namespace..."
kubectl apply -f "$APP_DIR/namespace.yaml"
echo -e "${GREEN}✅ Namespace created${NC}"
echo ""

# Step 2: Deploy infrastructure
echo "🏗️  Step 2/6: Deploying infrastructure..."

# Database
echo "  → Deploying database..."
kubectl apply -f "$APP_DIR/database/secret.yaml"
kubectl apply -f "$APP_DIR/database/service.yaml"
kubectl apply -f "$APP_DIR/database/statefulset.yaml"

# Wait for database to be ready
echo "  → Waiting for database to be ready..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=postgres -n $NAMESPACE --timeout=120s || {
    echo -e "${YELLOW}⚠️  Database pod not ready yet, continuing...${NC}"
}

# RBAC
echo "  → Deploying RBAC..."
kubectl apply -f "$APP_DIR/rbac/serviceaccounts/"
kubectl apply -f "$APP_DIR/rbac/roles/"
kubectl apply -f "$APP_DIR/rbac/rolebindings/"

# Network Policies
echo "  → Deploying Network Policies..."
kubectl apply -f "$APP_DIR/network-policies/"

# Resource Management
echo "  → Deploying Resource Management..."
kubectl apply -f "$APP_DIR/resource-management/"

# CronJobs
echo "  → Deploying CronJobs..."
kubectl apply -f "$APP_DIR/jobs/cronjobs/"

# Telemetry (Jaeger)
echo "  → Deploying Jaeger (Telemetry)..."
kubectl apply -f "$APP_DIR/telemetry/jaeger-service.yaml"
kubectl apply -f "$APP_DIR/telemetry/jaeger-deployment.yaml"
kubectl apply -f "$APP_DIR/telemetry/jaeger-ingress.yaml"

echo -e "${GREEN}✅ Infrastructure deployed${NC}"
echo ""

# Step 3: Build Docker images
echo "🔨 Step 3/6: Building Docker images..."
"$SCRIPT_DIR/build-images.sh"
echo ""

# Step 4: Install services with Helm
echo "🚀 Step 4/6: Installing services with Helm..."

# Check if services already exist (from Helm)
if helm list -n $NAMESPACE | grep -q "auth-service\|user-service\|product-service\|api-gateway\|frontend"; then
    echo -e "${YELLOW}⚠️  Some Helm releases already exist. Upgrading...${NC}"
    UPGRADE_MODE=true
else
    UPGRADE_MODE=false
fi

if [ "$UPGRADE_MODE" = true ]; then
    helm upgrade auth-service "$CHARTS_DIR/auth-service" -n $NAMESPACE
    helm upgrade user-service "$CHARTS_DIR/user-service" -n $NAMESPACE
    helm upgrade product-service "$CHARTS_DIR/product-service" -n $NAMESPACE
    helm upgrade api-gateway "$CHARTS_DIR/api-gateway" -n $NAMESPACE
    helm upgrade frontend "$CHARTS_DIR/frontend" -n $NAMESPACE
else
    helm install auth-service "$CHARTS_DIR/auth-service" -n $NAMESPACE
    helm install user-service "$CHARTS_DIR/user-service" -n $NAMESPACE
    helm install product-service "$CHARTS_DIR/product-service" -n $NAMESPACE
    helm install api-gateway "$CHARTS_DIR/api-gateway" -n $NAMESPACE
    helm install frontend "$CHARTS_DIR/frontend" -n $NAMESPACE
fi

echo -e "${GREEN}✅ Services installed${NC}"
echo ""

# Step 5: Deploy Ingress
echo "🌐 Step 5/6: Deploying Ingress..."
kubectl apply -f "$APP_DIR/ingress/"
echo -e "${GREEN}✅ Ingress deployed${NC}"
echo ""

# Step 6: Wait for pods to be ready
echo "⏳ Step 6/6: Waiting for pods to be ready..."
echo "  (This may take a few minutes...)"

TIMEOUT=300  # 5 minutes
START_TIME=$(date +%s)

while true; do
    READY_PODS=$(kubectl get pods -n $NAMESPACE -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}' | grep -o "True" | wc -l | tr -d ' ')
    TOTAL_PODS=$(kubectl get pods -n $NAMESPACE --no-headers 2>/dev/null | wc -l | tr -d ' ')
    
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    if [ "$READY_PODS" -eq "$TOTAL_PODS" ] && [ "$TOTAL_PODS" -gt 0 ]; then
        echo -e "${GREEN}✅ All pods are ready!${NC}"
        break
    fi
    
    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo -e "${YELLOW}⚠️  Timeout waiting for pods. Some may still be starting.${NC}"
        break
    fi
    
    echo "  → Ready: $READY_PODS/$TOTAL_PODS pods"
    sleep 5
done

echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "📊 Deployment Summary:"
echo "  Namespace: $NAMESPACE"
echo "  Helm Releases:"
helm list -n $NAMESPACE --short
echo ""
echo "🔍 To check status:"
echo "  ./scripts/show-status.sh"
echo ""
echo "🏥 To check health:"
echo "  ./scripts/check-health.sh"
echo ""
echo "🌐 Access points:"
echo "  Frontend: http://localhost/"
echo "  API Gateway: http://localhost/api/health"
echo "  Jaeger UI: http://localhost/jaeger"


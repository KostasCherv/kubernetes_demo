#!/bin/bash

# Complete cleanup script - removes all Kubernetes resources and Docker images
# Usage: ./scripts/cleanup-all.sh [--skip-images] [--force]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

NAMESPACE="k8s-microservices"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse arguments
DELETE_IMAGES=true  # Default: delete images
FORCE=false

for arg in "$@"; do
    case $arg in
        --skip-images)
            DELETE_IMAGES=false
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
            ;;
    esac
done

echo "=== Complete Cleanup ==="
echo ""
echo -e "${RED}⚠️  WARNING: This will delete ALL resources in namespace '$NAMESPACE'${NC}"
echo ""
echo "This will delete:"
echo "  - All Helm releases (auth-service, user-service, product-service, api-gateway, frontend)"
echo "  - All Deployments, Services, ConfigMaps, HPAs"
echo "  - Database (StatefulSet, Service, PVCs)"
echo "  - Secrets"
echo "  - CronJobs and Jobs"
echo "  - RBAC (ServiceAccounts, Roles, RoleBindings)"
echo "  - Network Policies"
echo "  - ResourceQuota and LimitRange"
echo "  - Ingress"
echo "  - The entire namespace"
if [ "$DELETE_IMAGES" = true ]; then
    echo "  - Docker images (auth-service, user-service, product-service, api-gateway, frontend)"
else
    echo "  - Docker images (skipped - use default behavior to delete)"
fi
echo ""

if [ "$FORCE" != true ]; then
    read -p "Are you sure you want to continue? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Namespace '$NAMESPACE' does not exist. Nothing to clean up.${NC}"
    exit 0
fi

echo ""
echo "🗑️  Starting cleanup..."
echo ""

# Step 1: Uninstall Helm releases
echo "📦 Step 1/4: Uninstalling Helm releases..."
if helm list -n $NAMESPACE --short | grep -q .; then
    helm uninstall $(helm list -n $NAMESPACE --short) -n $NAMESPACE || true
    echo -e "${GREEN}✅ Helm releases uninstalled${NC}"
else
    echo -e "${YELLOW}⚠️  No Helm releases found${NC}"
fi
echo ""

# Step 2: Delete all resources in namespace (except namespace itself)
echo "🗑️  Step 2/4: Deleting all resources in namespace..."
kubectl delete all --all -n $NAMESPACE --ignore-not-found=true
kubectl delete configmap --all -n $NAMESPACE --ignore-not-found=true
kubectl delete secret --all -n $NAMESPACE --ignore-not-found=true
kubectl delete hpa --all -n $NAMESPACE --ignore-not-found=true
kubectl delete cronjob --all -n $NAMESPACE --ignore-not-found=true
kubectl delete job --all -n $NAMESPACE --ignore-not-found=true
kubectl delete statefulset --all -n $NAMESPACE --ignore-not-found=true
kubectl delete pvc --all -n $NAMESPACE --ignore-not-found=true
kubectl delete networkpolicy --all -n $NAMESPACE --ignore-not-found=true
kubectl delete ingress --all -n $NAMESPACE --ignore-not-found=true
kubectl delete resourcequota --all -n $NAMESPACE --ignore-not-found=true
kubectl delete limitrange --all -n $NAMESPACE --ignore-not-found=true
kubectl delete role --all -n $NAMESPACE --ignore-not-found=true
kubectl delete rolebinding --all -n $NAMESPACE --ignore-not-found=true
kubectl delete serviceaccount --all -n $NAMESPACE --ignore-not-found=true
echo -e "${GREEN}✅ Resources deleted${NC}"
echo ""

# Step 3: Delete namespace
echo "🗑️  Step 3/4: Deleting namespace..."
kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
echo -e "${GREEN}✅ Namespace deleted${NC}"
echo ""

# Step 4: Delete Docker images (default behavior)
if [ "$DELETE_IMAGES" = true ]; then
    echo "🐳 Step 4/4: Deleting Docker images..."
    SERVICES=("auth-service" "user-service" "product-service" "api-gateway" "frontend")
    
    for service in "${SERVICES[@]}"; do
        if docker images | grep -q "^${service}"; then
            docker rmi "${service}:latest" 2>/dev/null || true
            echo "  → Removed ${service}:latest"
        fi
    done
    echo -e "${GREEN}✅ Docker images removed${NC}"
    echo ""
else
    echo "ℹ️  Step 4/4: Skipping Docker image deletion (use default behavior to delete)"
    echo ""
fi

echo -e "${GREEN}=== Cleanup Complete ===${NC}"
echo ""
echo "✅ All resources have been removed from namespace '$NAMESPACE'"
if [ "$DELETE_IMAGES" != true ]; then
    echo ""
    echo "💡 To delete Docker images next time, run without --skip-images flag:"
    echo "   ./scripts/cleanup-all.sh"
fi


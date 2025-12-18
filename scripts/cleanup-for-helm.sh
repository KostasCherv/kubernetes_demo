#!/bin/bash

# Cleanup script to remove existing Kubernetes resources before installing with Helm
# This keeps: database, secrets, CronJobs, RBAC, Network Policies, ResourceQuota, LimitRange

set -e

NAMESPACE="k8s-microservices"

echo "=== Cleaning up for Helm installation ==="
echo ""
echo "This will delete:"
echo "  - Deployments (api-gateway, auth-service, user-service, product-service, frontend)"
echo "  - Services (api-gateway, auth-service, user-service, product-service, frontend)"
echo "  - ConfigMaps (service configs)"
echo "  - HPAs (service autoscalers)"
echo ""
echo "This will KEEP:"
echo "  - Database (postgres StatefulSet and Service)"
echo "  - Secrets (postgres-secret)"
echo "  - CronJobs (backup, cleanup)"
echo "  - RBAC (ServiceAccounts, Roles, RoleBindings)"
echo "  - Network Policies"
echo "  - ResourceQuota and LimitRange"
echo ""

read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "Deleting Deployments..."
kubectl delete deployment api-gateway auth-service user-service product-service frontend -n $NAMESPACE --ignore-not-found=true

echo "Deleting Services..."
kubectl delete service api-gateway auth-service user-service product-service frontend -n $NAMESPACE --ignore-not-found=true

echo "Deleting ConfigMaps..."
kubectl delete configmap api-gateway-config auth-service-config user-service-config product-service-config frontend-config -n $NAMESPACE --ignore-not-found=true

echo "Deleting HPAs..."
kubectl delete hpa api-gateway-hpa auth-service-hpa user-service-hpa product-service-hpa -n $NAMESPACE --ignore-not-found=true

echo "Cleaning up completed Jobs..."
kubectl delete jobs -n $NAMESPACE --field-selector status.successful=1 --ignore-not-found=true

echo ""
echo "=== Cleanup Complete ==="
echo ""
echo "Remaining resources:"
kubectl get all -n $NAMESPACE
echo ""
echo "You can now install services using Helm charts:"
echo "  helm install auth-service ./app/helm-charts/auth-service -n $NAMESPACE"
echo "  helm install user-service ./app/helm-charts/user-service -n $NAMESPACE"
echo "  helm install product-service ./app/helm-charts/product-service -n $NAMESPACE"
echo "  helm install api-gateway ./app/helm-charts/api-gateway -n $NAMESPACE"
echo "  helm install frontend ./app/helm-charts/frontend -n $NAMESPACE"


#!/bin/bash

# Install all microservices using Helm charts
# Prerequisites: Database, RBAC, Network Policies, ResourceQuota should already be deployed

set -e

NAMESPACE="k8s-microservices"
CHARTS_DIR="app/helm-charts"

echo "=== Installing Microservices with Helm ==="
echo ""

# Check if Helm is installed
if ! command -v helm &> /dev/null; then
    echo "Error: Helm is not installed. Please install Helm 3.x first."
    exit 1
fi

# Check if namespace exists
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo "Error: Namespace $NAMESPACE does not exist. Please create it first."
    exit 1
fi

echo "Installing auth-service..."
helm install auth-service $CHARTS_DIR/auth-service -n $NAMESPACE

echo ""
echo "Installing user-service..."
helm install user-service $CHARTS_DIR/user-service -n $NAMESPACE

echo ""
echo "Installing product-service..."
helm install product-service $CHARTS_DIR/product-service -n $NAMESPACE

echo ""
echo "Installing api-gateway..."
helm install api-gateway $CHARTS_DIR/api-gateway -n $NAMESPACE

echo ""
echo "Installing frontend..."
helm install frontend $CHARTS_DIR/frontend -n $NAMESPACE

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Checking Helm releases:"
helm list -n $NAMESPACE

echo ""
echo "Checking pod status:"
kubectl get pods -n $NAMESPACE

echo ""
echo "To check status of a specific service:"
echo "  helm status auth-service -n $NAMESPACE"
echo ""
echo "To view logs:"
echo "  kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=auth-service"


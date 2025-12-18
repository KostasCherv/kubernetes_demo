#!/bin/bash

# Build all Docker images for microservices
# Usage: ./scripts/build-images.sh [--push]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SERVICES=(
    "auth-service"
    "user-service"
    "product-service"
    "api-gateway"
    "frontend"
)

echo "=== Building Docker Images ==="
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Check for --push flag
PUSH_IMAGES=false
if [[ "$1" == "--push" ]]; then
    PUSH_IMAGES=true
    echo "⚠️  Push mode enabled (images will be pushed to registry)"
    echo ""
fi

cd "$PROJECT_ROOT"

for service in "${SERVICES[@]}"; do
    SERVICE_DIR="app/services/$service"
    
    if [ ! -d "$SERVICE_DIR" ]; then
        echo "⚠️  Skipping $service: directory not found"
        continue
    fi
    
    if [ ! -f "$SERVICE_DIR/Dockerfile" ]; then
        echo "⚠️  Skipping $service: Dockerfile not found"
        continue
    fi
    
    echo "📦 Building $service..."
    cd "$SERVICE_DIR"
    
    # Build image
    docker build -t "${service}:latest" .
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully built ${service}:latest"
    else
        echo "❌ Failed to build ${service}:latest"
        exit 1
    fi
    
    # Push if flag is set
    if [ "$PUSH_IMAGES" = true ]; then
        echo "📤 Pushing ${service}:latest..."
        docker push "${service}:latest"
        if [ $? -eq 0 ]; then
            echo "✅ Successfully pushed ${service}:latest"
        else
            echo "❌ Failed to push ${service}:latest"
            exit 1
        fi
    fi
    
    echo ""
    cd "$PROJECT_ROOT"
done

echo "=== Build Complete ==="
echo ""
echo "Built images:"
for service in "${SERVICES[@]}"; do
    echo "  - ${service}:latest"
done
echo ""
echo "To verify images:"
echo "  docker images | grep -E '$(IFS='|'; echo "${SERVICES[*]}")'"


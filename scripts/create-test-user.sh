#!/bin/bash

# Create a test user in the PostgreSQL database
# Usage: ./scripts/create-test-user.sh

set -e

NAMESPACE="k8s-microservices"
DB_POD="postgres-0"
DB_NAME="microservices_db"
DB_USER="postgres"
TEST_USERNAME="testuser"
TEST_PASSWORD="testpass123"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=== Creating Test User in Database ==="
echo ""

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    echo -e "${RED}❌ Namespace '$NAMESPACE' does not exist${NC}"
    exit 1
fi

# Check if database pod exists
if ! kubectl get pod "$DB_POD" -n "$NAMESPACE" &> /dev/null; then
    echo -e "${RED}❌ Database pod '$DB_POD' not found in namespace '$NAMESPACE'${NC}"
    exit 1
fi

# Check if pod is ready
POD_STATUS=$(kubectl get pod "$DB_POD" -n "$NAMESPACE" -o jsonpath='{.status.phase}')
if [ "$POD_STATUS" != "Running" ]; then
    echo -e "${YELLOW}⚠️  Database pod is not running (status: $POD_STATUS)${NC}"
    exit 1
fi

echo -e "${BLUE}📊 Database: $DB_NAME${NC}"
echo -e "${BLUE}👤 Test User: $TEST_USERNAME${NC}"
echo ""

echo "🔧 Creating/updating test user..."
echo ""

# Build SQL command - using dollar-quoted strings to avoid quote issues
read -r -d '' SQL_CMD <<EOF || true
DO \$\$
BEGIN
    IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${TEST_USERNAME}') THEN
        ALTER USER ${TEST_USERNAME} WITH PASSWORD '${TEST_PASSWORD}';
        RAISE NOTICE 'User ${TEST_USERNAME} already exists. Password updated.';
    ELSE
        CREATE USER ${TEST_USERNAME} WITH PASSWORD '${TEST_PASSWORD}';
        RAISE NOTICE 'User ${TEST_USERNAME} created successfully.';
    END IF;
    GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${TEST_USERNAME};
    GRANT ALL ON SCHEMA public TO ${TEST_USERNAME};
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${TEST_USERNAME};
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${TEST_USERNAME};
END
\$\$;
EOF

# Execute SQL script
if kubectl exec -n "$NAMESPACE" "$DB_POD" -- psql -U "$DB_USER" -d "$DB_NAME" -c "$SQL_CMD" 2>&1; then
    echo ""
    echo -e "${GREEN}✅ Test user '$TEST_USERNAME' is ready!${NC}"
    echo ""
    echo "📋 Connection Details:"
    echo "  Host: localhost (after port-forward)"
    echo "  Port: 5432"
    echo "  Database: $DB_NAME"
    echo "  Username: $TEST_USERNAME"
    echo "  Password: $TEST_PASSWORD"
    echo ""
    echo "💡 To connect:"
    echo "  1. Port forward: kubectl port-forward -n $NAMESPACE svc/postgres 5432:5432"
    echo "  2. Connect: psql -h localhost -U $TEST_USERNAME -d $DB_NAME"
    echo ""
    echo "   Or use kubectl exec:"
    echo "  kubectl exec -it -n $NAMESPACE $DB_POD -- psql -U $TEST_USERNAME -d $DB_NAME"
else
    echo ""
    echo -e "${RED}❌ Failed to create/update test user${NC}"
    exit 1
fi


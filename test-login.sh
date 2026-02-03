#!/bin/bash

# Test script for both admin login pages and dashboards
# This script tests the authentication flow and route accessibility

echo "=========================================="
echo "Testing Admin Login Pages & Dashboards"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test credentials
ADMIN_EMAIL="admin@energyprecisions.com"
ADMIN_PASSWORD="admin123"
API_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5000"

echo -e "${YELLOW}Step 1: Checking Services Status${NC}"
echo "----------------------------------------"
docker compose ps | grep -E "backend|frontend|db" | head -3
echo ""

echo -e "${YELLOW}Step 2: Testing Backend API Authentication${NC}"
echo "----------------------------------------"
echo "Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${ADMIN_EMAIL}&password=${ADMIN_PASSWORD}")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✓ Login successful${NC}"
    TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✓ Token received${NC}"
        echo "Token (first 20 chars): ${TOKEN:0:20}..."
    else
        echo -e "${RED}✗ Could not extract token${NC}"
    fi
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
fi
echo ""

echo -e "${YELLOW}Step 3: Testing Current User Endpoint${NC}"
echo "----------------------------------------"
if [ -n "$TOKEN" ]; then
    USER_RESPONSE=$(curl -s -X GET "${API_URL}/api/auth/me" \
      -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$USER_RESPONSE" | grep -q "email"; then
        echo -e "${GREEN}✓ User info retrieved${NC}"
        echo "$USER_RESPONSE" | python3 -m json.tool 2>/dev/null | head -10
    else
        echo -e "${RED}✗ Failed to get user info${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Skipping (no token)${NC}"
fi
echo ""

echo -e "${YELLOW}Step 4: Testing Frontend Routes${NC}"
echo "----------------------------------------"
echo "Note: React Router routes return 200 (HTML) but routing is client-side"
echo ""

echo "Testing Public Website:"
PUBLIC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}/")
if [ "$PUBLIC_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Public website accessible (Status: $PUBLIC_STATUS)${NC}"
else
    echo -e "${RED}✗ Public website not accessible (Status: $PUBLIC_STATUS)${NC}"
fi

echo ""
echo "Testing PMS Login Page Route:"
PMS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}/pms/admin")
if [ "$PMS_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ PMS login route accessible (Status: $PMS_STATUS)${NC}"
    echo "  URL: ${FRONTEND_URL}/pms/admin"
else
    echo -e "${YELLOW}⚠ PMS login route (Status: $PMS_STATUS)${NC}"
    echo "  Note: React Router handles this client-side"
fi

echo ""
echo "Testing Web Admin Login Page Route:"
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}/web/admin")
if [ "$WEB_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Web admin login route accessible (Status: $WEB_STATUS)${NC}"
    echo "  URL: ${FRONTEND_URL}/web/admin"
else
    echo -e "${YELLOW}⚠ Web admin login route (Status: $WEB_STATUS)${NC}"
    echo "  Note: React Router handles this client-side"
fi

echo ""
echo "Testing PMS Dashboard Route (should redirect if not authenticated):"
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}/pms/dashboard")
if [ "$DASHBOARD_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ PMS dashboard route accessible (Status: $DASHBOARD_STATUS)${NC}"
    echo "  URL: ${FRONTEND_URL}/pms/dashboard"
    echo "  Note: React will redirect to login if not authenticated"
else
    echo -e "${YELLOW}⚠ PMS dashboard route (Status: $DASHBOARD_STATUS)${NC}"
fi
echo ""

echo -e "${YELLOW}Step 5: Testing Protected API Endpoints${NC}"
echo "----------------------------------------"
if [ -n "$TOKEN" ]; then
    echo "Testing /api/customers endpoint:"
    CUSTOMERS_RESPONSE=$(curl -s -X GET "${API_URL}/api/customers/" \
      -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$CUSTOMERS_RESPONSE" | grep -q "\[\]" || echo "$CUSTOMERS_RESPONSE" | grep -q "id"; then
        echo -e "${GREEN}✓ Customers endpoint accessible${NC}"
        CUSTOMER_COUNT=$(echo "$CUSTOMERS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data) if isinstance(data, list) else 0)" 2>/dev/null)
        echo "  Found $CUSTOMER_COUNT customers"
    else
        echo -e "${RED}✗ Customers endpoint failed${NC}"
        echo "  Response: ${CUSTOMERS_RESPONSE:0:100}..."
    fi
    
    echo ""
    echo "Testing /api/projects endpoint:"
    PROJECTS_RESPONSE=$(curl -s -X GET "${API_URL}/api/projects/" \
      -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$PROJECTS_RESPONSE" | grep -q "\[\]" || echo "$PROJECTS_RESPONSE" | grep -q "id"; then
        echo -e "${GREEN}✓ Projects endpoint accessible${NC}"
        PROJECT_COUNT=$(echo "$PROJECTS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data) if isinstance(data, list) else 0)" 2>/dev/null)
        echo "  Found $PROJECT_COUNT projects"
    else
        echo -e "${RED}✗ Projects endpoint failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Skipping (no token)${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}Test Summary${NC}"
echo "=========================================="
echo ""
echo "Access URLs:"
echo "  • Public Website:    ${FRONTEND_URL}/"
echo "  • PMS Login:         ${FRONTEND_URL}/pms/admin"
echo "  • Web Admin Login:   ${FRONTEND_URL}/web/admin"
echo "  • PMS Dashboard:     ${FRONTEND_URL}/pms/dashboard"
echo ""
echo "Test Credentials:"
echo "  • Email:    ${ADMIN_EMAIL}"
echo "  • Password: ${ADMIN_PASSWORD}"
echo ""
echo -e "${YELLOW}Note:${NC} React Router routes are handled client-side."
echo "Open the URLs in a browser to test the full login flow."
echo ""

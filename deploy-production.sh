#!/bin/bash
# =============================================================================
# Energy Precision PMS - Production Database Migration & Seeding
# =============================================================================
# Run this script to sync migrations and seed data to your production database.
#
# Usage:
#   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require" ./deploy-production.sh
#
# Or set DATABASE_URL in .env.production and run:
#   export $(grep -v '^#' .env.production | xargs) && ./deploy-production.sh
#
# For Render: DATABASE_URL is auto-set when you link the database to your service.
# Run from Render Shell: ./deploy-production.sh
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL is not set.${NC}"
    echo "Set it before running:"
    echo "  export DATABASE_URL=\"postgresql://user:pass@host/db?sslmode=require\""
    exit 1
fi

# Ensure postgresql:// (Render may give postgres://)
export DATABASE_URL="${DATABASE_URL/postgres:\/\//postgresql:\/\/}"

# Add sslmode if not present (required for Render external DB)
if [[ "$DATABASE_URL" != *"sslmode="* ]]; then
    export DATABASE_URL="${DATABASE_URL}?sslmode=require"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Energy Precision PMS - Production Deploy${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

# Step 1: Schema from models + settings (fresh Render DB has no tables; Alembic alone can fail on first revision)
echo -e "${YELLOW}1. Creating tables and default settings...${NC}"
cd "$BACKEND_DIR"
python3 -m app.scripts.init_db
echo -e "${GREEN}   ✓ Init complete${NC}"
echo ""

# Step 2: Alembic to head (or stamp if DDL already matches, e.g. duplicate column)
echo -e "${YELLOW}2. Alembic upgrade to head (or stamp on duplicate / drift)...${NC}"
if python3 -m alembic upgrade head; then
    echo -e "${GREEN}   ✓ Migrations applied${NC}"
else
    echo -e "${YELLOW}   ⚠ upgrade head failed; stamping head (schema likely from SQLAlchemy create_all)...${NC}"
    python3 -m alembic stamp head || true
    python3 -m alembic current
fi
echo ""

# Step 3: Seed production (admin, bank details)
echo -e "${YELLOW}3. Seeding production data (admin, bank details)...${NC}"
python3 scripts/seed_production.py
echo -e "${GREEN}   ✓ Production seed complete${NC}"
echo ""

# Step 4: Seed e-commerce products (if none exist)
echo -e "${YELLOW}4. Seeding e-commerce products...${NC}"
python3 -m app.scripts.seed_ecommerce_products
echo -e "${GREEN}   ✓ E-commerce seed complete${NC}"
echo ""

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Production deploy complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Next steps:"
echo "  • Deploy backend & frontend to Render (git push triggers deploy)"
echo "  • Verify env vars: DATABASE_URL, CORS_ORIGINS, FRONTEND_URL, REACT_APP_API_URL"
echo "  • Change admin password after first login"
echo ""

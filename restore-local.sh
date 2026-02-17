#!/bin/bash
# Restore local Energy Precision PMS (Phase 1)
# Run after starting Docker Desktop: ./restore-local.sh

set -e
cd "$(dirname "$0")"

echo "Starting containers (db, backend, frontend)..."
docker compose up -d

echo "Waiting for database to be ready..."
sleep 8

echo "Initializing database (settings, admin user)..."
docker compose exec -T backend python -m app.scripts.init_db

echo "Setting up bank details (Proforma Invoice)..."
docker compose exec -T backend python -m app.scripts.setup_bank_details 2>/dev/null || true
docker compose exec -T backend python -m app.scripts.set_default_bank_details 2>/dev/null || true

echo ""
echo "Done! Open http://localhost:5000"
echo "Login: admin@energyprecisions.com / admin123"
echo ""

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
if [[ -z "${DEFAULT_ADMIN_PASSWORD:-}" ]]; then
  echo "ERROR: DEFAULT_ADMIN_PASSWORD is not set."
  echo "Set it first, e.g.: export DEFAULT_ADMIN_PASSWORD='change-me-now'"
  exit 2
fi
docker compose exec -T backend python -m app.scripts.create_default_admin

echo "Setting up bank details (Proforma Invoice)..."
docker compose exec -T backend python -m app.scripts.setup_bank_details 2>/dev/null || true
docker compose exec -T backend python -m app.scripts.set_default_bank_details 2>/dev/null || true

echo ""
echo "Done! Open http://localhost:5000"
echo "Login: admin@energyprecisions.com"
echo "Password: (the value you set in DEFAULT_ADMIN_PASSWORD)"
echo ""

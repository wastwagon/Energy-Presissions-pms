#!/bin/bash
# Energy Precision PMS - Full local setup
# Run this in Terminal (not inside Cursor) after Docker Desktop is running.

set -e
cd "$(dirname "$0")"

echo "=========================================="
echo " Energy Precision PMS - Local Setup"
echo "=========================================="
echo ""

if ! docker info &>/dev/null; then
  echo "ERROR: Docker is not running. Please start Docker Desktop and try again."
  exit 1
fi

echo "[1/5] Starting containers (db, backend, frontend)..."
docker compose up -d --build

echo ""
echo "[2/5] Waiting for database to be ready..."
sleep 10

echo ""
echo "[3/5] Initializing database (settings, peak sun hours)..."
docker compose exec -T backend python -m app.scripts.init_db

echo ""
echo "[4/5] Creating admin user..."
docker compose exec -T backend python -m app.scripts.create_default_admin

echo ""
echo "[5/5] Setting up bank details (Proforma Invoice)..."
docker compose exec -T backend python -m app.scripts.setup_bank_details 2>/dev/null || true
docker compose exec -T backend python -m app.scripts.set_default_bank_details 2>/dev/null || true

echo ""
echo "=========================================="
echo " Setup complete!"
echo "=========================================="
echo ""
echo "  App:    http://localhost:5000"
echo "  API:    http://localhost:8000/docs"
echo ""
echo "  Login:  admin@energyprecisions.com"
echo "  Pass:   admin123"
echo ""
echo "=========================================="

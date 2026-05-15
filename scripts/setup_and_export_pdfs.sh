#!/usr/bin/env bash
# Energy Precision PMS — local setup + export PDFs to ~/Downloads
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
DOWNLOADS="${HOME}/Downloads"

echo "==> Starting Docker stack..."
docker compose up -d

echo "==> Waiting for database..."
for i in $(seq 1 30); do
  if docker compose exec -T db pg_isready -U energy_pms >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "==> Initialize settings & peak sun hours..."
docker compose exec -T backend python -m app.scripts.init_db

echo "==> Seed proforma / BOM catalog SKUs..."
docker compose exec -T backend python -m app.scripts.seed_proforma_catalog_items

mkdir -p backend/exports

echo "==> Fix BOM + export checklist PDFs (latest quotes)..."
for QID in 1 2; do
  docker compose exec -T backend python -m app.scripts.export_bom_checklist_pdf \
    --quote-id "$QID" --fix-bom --output "/app/exports/bom_checklist_quote_${QID}.pdf" || true
done

echo "==> Export quotation PDFs..."
docker compose exec -T backend python -m app.scripts.export_quotation_pdf \
  --quote-id 1 --output /app/exports/quotation_quote_1.pdf || true
docker compose exec -T backend python -m app.scripts.export_quotation_pdf \
  --quote-id 1 --proforma --output /app/exports/proforma_quote_1.pdf || true
docker compose exec -T backend python -m app.scripts.export_quotation_pdf \
  --quote-id 2 --output /app/exports/quotation_quote_2.pdf || true

echo "==> Copy PDFs to Downloads folder: $DOWNLOADS"
cp -f backend/exports/*.pdf "$DOWNLOADS/" 2>/dev/null || true

# Friendly names for known quotes
[[ -f backend/exports/bom_checklist_quote_1.pdf ]] && \
  cp -f backend/exports/bom_checklist_quote_1.pdf "$DOWNLOADS/bom_checklist_EP-2025-00028.pdf"
[[ -f backend/exports/bom_checklist_quote_2.pdf ]] && \
  cp -f backend/exports/bom_checklist_quote_2.pdf "$DOWNLOADS/bom_checklist_QT-COLLINS.pdf"

echo ""
echo "Done. App URLs:"
echo "  Frontend: http://localhost:5000"
echo "  API:      http://localhost:8000/docs"
echo ""
echo "PDFs in Downloads:"
ls -1 "$DOWNLOADS"/bom_checklist*.pdf "$DOWNLOADS"/quotation*.pdf "$DOWNLOADS"/proforma*.pdf 2>/dev/null || \
  ls -1 "$DOWNLOADS"/*EP-2025* "$DOWNLOADS"/*COLLINS* 2>/dev/null || true

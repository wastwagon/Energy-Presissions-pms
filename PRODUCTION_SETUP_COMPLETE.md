# Production Setup Complete

This document confirms the professional setup performed against your Render external database.

## Database

- **URL:** `postgresql://...@dpg-d6126asr85hc739ilucg-a.oregon-postgres.render.com/energy_pms_7hx7`
- **Connection:** SSL required (`?sslmode=require`)

## Completed Steps

### 1. Alembic Migrations

- **Issue:** Multiple migration heads (branching) were merged.
- **Fix:** Added merge migration `8dea1447cce3_merge_ecommerce_and_sizing_heads.py`.
- **State:** Database already had full schema from `Base.metadata.create_all()`. Stamped to head.
- **`alembic/env.py`:** Updated to use `DATABASE_URL` when set (for local runs against Render DB).

### 2. Database Seeding

| Script | Status | Purpose |
|--------|--------|---------|
| `init_db` | ✅ Complete | Default settings, peak sun hours (Ghana cities) |
| `create_default_admin` | ✅ Complete | Admin user: admin@energyprecisions.com / admin123 |
| `setup_bank_details` | ✅ Complete | Bank-related settings for Proforma Invoice |
| `seed_ecommerce_products` | ✅ Complete | 7 sample products (panels, inverters, batteries) |

### 3. Admin Credentials

| Field | Value |
|-------|-------|
| **Email** | `admin@energyprecisions.com` |
| **Password** | `admin123` |

**Change this password after first login.**

### 4. E-commerce Sample Products

- JA Solar 570W Solar Panel  
- Jinko 580W Solar Panel  
- Longi 550W Solar Panel  
- Energy Precision 10kW Inverter  
- Energy Precision 5kW Inverter  
- Energy Precisions 16kWh Battery  
- Energy Precisions 8kWh Battery  

### 5. Auxiliary Script

- **`backend/scripts/seed_production.py`** – Standalone script to create admin and bank settings.  
  Run: `DATABASE_URL=<url> python3 backend/scripts/seed_production.py`

## Render Deployment

Your backend at `https://energy-pms-backend-1b7h.onrender.com` uses this database via the `DATABASE_URL` environment variable. All seeds are applied, so PMS and e-commerce will work against production.

## Next Steps

1. Log in at `https://energyprecisions.com/pms/admin` with the admin credentials above.
2. Change the admin password.
3. Configure bank details in **PMS → Settings → Other**.
4. Add Paystack keys when ready: `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `FRONTEND_URL`.

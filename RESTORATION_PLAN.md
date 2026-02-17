# Restoration Plan – Energy Precision PMS (Docker + Render)

You deleted local Docker containers and the local database. Your **Render** deployment (frontend, backend, `energy-pms-db`) is still running. This plan gets you back to a working local setup and optionally uses Render’s database.

---

## Current state

- **Local:** Containers and Postgres data are gone. Your **project code** is still on disk.
- **Render:** Services are up: `energy-pms-frontend`, `energy-pms-backend`, `energy-pms-db` (PostgreSQL 18, Oregon).
- **Render external DB URL:**  
  `postgresql://energy_pms:1vRyoWoCctFDa7lIMg0kVZUAVRoy8eWe@dpg-d6126asr85hc739ilucg-a.oregon-postgres.render.com/energy_pms_7hx7`

---

## Phase 1: Local stack with fresh local database (quick restore)

**Goal:** Run the app locally again with a new, empty database.

1. Open a terminal in the project root:  
   `cd /Users/OceanCyber/Downloads/EnergyPrecisionPMS`

2. Start all services:
   ```bash
   docker compose up -d
   ```

3. Wait for the DB to be healthy, then seed the database and create admin:
   ```bash
   docker compose exec backend python -m app.scripts.init_db
   docker compose exec backend python -m app.scripts.setup_bank_details
   docker compose exec backend python -m app.scripts.set_default_bank_details
   ```
   (Last two are optional – for Proforma bank details.)

4. Open in the browser:
   - **App:** http://localhost:5000  
   - **API docs:** http://localhost:8000/docs  

5. Log in (default):  
   Email: `admin@energyprecisions.com`  
   Password: `admin123`  

**Result:** Local app running with a **new empty** DB (no customers/projects from Render).

---

## Phase 2a: Use Render’s database from your local app (recommended)

**Goal:** Keep running backend + frontend **locally** in Docker, but connect the backend to **Render’s Postgres** so you see the same data as on Render.

1. In the project root, create a file named `.env` (if it doesn’t exist).

2. Add this line (use your actual Render external URL):
   ```env
   DATABASE_URL=postgresql://energy_pms:1vRyoWoCctFDa7lIMg0kVZUAVRoy8eWe@dpg-d6126asr85hc739ilucg-a.oregon-postgres.render.com/energy_pms_7hx7
   ```
   If Render requires SSL, use:
   ```env
   DATABASE_URL=postgresql://energy_pms:1vRyoWoCctFDa7lIMg0kVZUAVRoy8eWe@dpg-d6126asr85hc739ilucg-a.oregon-postgres.render.com/energy_pms_7hx7?sslmode=require
   ```

3. Restart the backend so it picks up `DATABASE_URL`:
   ```bash
   docker compose up -d
   ```
   (Or `docker compose restart backend`.)

4. Open http://localhost:5000 and log in with your **Render** admin user (same as production).

**Result:** Local UI and API, with **Render’s data** (customers, projects, quotes, etc.). No data copy needed.

**Notes:**

- The local `db` container will still start; the backend will use `DATABASE_URL` and ignore it.
- Do not run destructive commands (e.g. `init_db` that drops/recreates tables) when connected to Render, or you will wipe production data.

---

## Phase 2b: Restore Render data into a new local Postgres (optional)

**Goal:** Use a **local** Postgres again, but fill it with a one-time copy of Render’s data.

1. **Phase 1 first:** Run `docker compose up -d` so you have a local `db` and backend (without `DATABASE_URL` in `.env`, or with `DATABASE_URL` removed).

2. Install `psql` / `pg_dump` on your Mac if needed (e.g. `brew install libpq` and use `pg_dump` from there).

3. Dump from Render (run from your Mac; replace with your URL if different):
   ```bash
   pg_dump "postgresql://energy_pms:1vRyoWoCctFDa7lIMg0kVZUAVRoy8eWe@dpg-d6126asr85hc739ilucg-a.oregon-postgres.render.com/energy_pms_7hx7?sslmode=require" --no-owner --no-acl -F p -f render_backup.sql
   ```

4. Restore into the local Postgres container (local DB is empty after Phase 1):
   ```bash
   docker compose exec -T db psql -U energy_pms -d energy_pms < render_backup.sql
   ```
   If the local DB name is different, use that instead of `energy_pms`.

5. Remove `DATABASE_URL` from `.env` (or leave it commented) and restart backend:
   ```bash
   docker compose restart backend
   ```

**Result:** Local app with **local** Postgres containing a copy of Render’s data at the time of the dump.

---

## Summary

| Phase   | What you get |
|--------|----------------|
| **1**  | Local app + new empty local DB. Quick way to have everything “back and working” on Docker. |
| **2a** | Local app + **Render’s live DB**. Easiest way to get “everything back” with real data. |
| **2b** | Local app + local DB with a **snapshot** of Render’s data. Use when you want local-only DB but with production data. |

Recommendation: do **Phase 1** first to confirm the stack runs, then **Phase 2a** (add `.env` with `DATABASE_URL`) so your local Docker setup uses the same database as Render.

---

## If something fails

- **Backend won’t start:** Check `docker compose logs backend`. If you see “connection refused” or “SSL”, try adding `?sslmode=require` to `DATABASE_URL` or check Render’s “External Database URL” and network access.
- **Render DB not reachable:** Ensure Render’s Postgres allows external connections (your Render dashboard shows an external URL, so it should). Firewall/VPN can block outbound 5432.
- **Frontend can’t reach API:** Ensure `REACT_APP_API_URL` is `http://localhost:8000` for local use (default in docker-compose).

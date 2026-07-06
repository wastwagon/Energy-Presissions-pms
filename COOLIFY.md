# Deploy on Coolify (VPS) with Docker Compose

This stack runs **PostgreSQL**, **FastAPI backend**, and **nginx frontend** from a single compose file:

`docker-compose.coolify.yml`

The frontend container serves the React app **and** reverse-proxies `/api` to the backend, so you only need **one public domain** (e.g. `https://energyprecisions.com`).

---

## Architecture

```
Internet → Coolify proxy → frontend:80 (nginx)
                              ├─ /        → React static files
                              └─ /api/*   → backend:8000 (internal)
                                    └─ db:5432 (internal, persistent volume)
```

- **Public:** `frontend` only (port 80)
- **Private:** `backend`, `db` (Docker internal network)
- **Volumes:** `postgres_data`, `backend_static` (uploads/media on disk)

---

## 1. Prerequisites

- VPS with [Coolify](https://coolify.io/) installed
- Domain DNS pointing to the VPS (A record → server IP)
- Git repo access (GitHub/GitLab) or upload the project

---

## 2. Create the Coolify resource

1. In Coolify: **+ New Resource** → **Docker Compose**
2. Connect your Git repository (`EnergyPrecisionPMS`)
3. Set **Compose file path:** `docker-compose.coolify.yml`
4. **Build pack:** Docker Compose (Coolify builds images from Dockerfiles)

---

## 3. Environment variables

Copy from [`.env.coolify.example`](.env.coolify.example) into Coolify’s environment UI.

| Variable | Required | Notes |
|----------|----------|-------|
| `POSTGRES_PASSWORD` | Yes | Strong password for Postgres |
| `SECRET_KEY` | Yes | Long random string for JWT |
| `FRONTEND_URL` | Yes | Public site URL, e.g. `https://energyprecisions.com` |
| `DEFAULT_ADMIN_PASSWORD` | First deploy | Used when `AUTO_SEED=true` |
| `AUTO_SYNC_CMS_PAGES` | Recommended | `true` (default) — overwrites CMS pages from code on each backend restart (nav, contact, package prices). No manual admin edits needed. |
| `AUTO_SEED` | First deploy only | `true` on first boot, then `false` — full seed (admin, products, blog). CMS still syncs when `AUTO_SYNC_CMS_PAGES=true`. |
| `PAYSTACK_SECRET_KEY` | For checkout | Live keys from Paystack dashboard |

`FRONTEND_URL` is used for:

- Paystack return URL (`/checkout/success`)
- React `REACT_APP_API_URL` at build + runtime inject

---

## 4. Domain in Coolify

Assign your domain to the **`frontend`** service only. Include **`:80`** in the URL so Coolify generates Traefik `loadbalancer.server.port` labels (required when the service uses `expose`, not `ports`):

```text
https://energyprecisions.com:80
```

Visitors still use `https://energyprecisions.com` without the port in the browser.

Coolify’s Traefik/Caddy will terminate HTTPS and forward to the frontend container. Do **not** bind host port `80` in compose — Coolify already uses it for its proxy (`expose: 80` only).

If you recreate the Coolify resource, update the hardcoded resource UUID in `docker-compose.coolify.yml` Traefik labels (match the UUID in the Coolify resource URL).

**Do not** assign a backend/API subdomain. API traffic is same-origin at `/api/*` via nginx.

**Do not** expose `backend` or `db` to the internet.

In **Configuration → Advanced**, enable **Connect To Predefined Network** for the `frontend` service (attaches the shared `coolify` Docker network so Traefik can route to it).

---

## 5. Deploy

1. Save environment variables
2. Click **Deploy**
3. First boot runs Alembic migrations + seed scripts when `AUTO_SEED=true`
4. On every backend restart, `AUTO_SYNC_CMS_PAGES=true` (default) refreshes all CMS page content from bundled defaults — nav, global contact/stats, package prices, etc.
5. Verify:
   - `https://your-domain.com/health` → `healthy`
   - `https://your-domain.com/api/health` → `{"status":"healthy"}`
   - `https://your-domain.com/pms/admin` → staff login

---

## 6. Migrate from Render

### 6.1 Export Render Postgres

On your machine (with Render external DB URL):

```bash
pg_dump "$RENDER_DATABASE_URL" --no-owner --no-acl -Fc -f energy_pms_render.dump
```

### 6.2 Import into VPS Postgres

After the Coolify stack is running once (so the `db` volume exists), copy the dump to the server and restore:

```bash
# On VPS — replace container name if Coolify prefixes it
docker cp energy_pms_render.dump <compose_project>-db-1:/tmp/
docker exec -it <compose_project>-db-1 pg_restore -U energy_pms -d energy_pms --clean --if-exists /tmp/energy_pms_render.dump
```

Or use Coolify’s database UI if you attach to the Postgres container.

### 6.3 Media / uploads

Render ephemeral disk media may need backfill:

```bash
docker exec -it <compose_project>-backend-1 python -m app.scripts.backfill_media_content --assign-products
```

`backend_static` volume persists uploads under `/app/static`.

### 6.4 Cutover checklist

- [ ] DNS A record → VPS IP
- [ ] `FRONTEND_URL` + `CORS_ORIGINS` updated
- [ ] Paystack webhook → `https://your-domain.com/api/payments/paystack/webhook`
- [ ] `SECRET_KEY` set (not default) — **users must re-login** if changed
- [ ] Smoke test: shop, contact form, admin CMS, media images
- [ ] Disable Render services after verification

---

## 7. Local test (before VPS)

```bash
cp .env.coolify.example .env.coolify
# Edit .env.coolify — set passwords and FRONTEND_URL=http://localhost

docker compose --env-file .env.coolify -f docker-compose.coolify.yml up --build
```

Open `http://localhost` and `http://localhost/api/health`.

---

## 8. Operations

| Task | Command |
|------|---------|
| View logs | Coolify UI → service logs, or `docker compose logs -f backend` |
| Restart | Coolify **Restart** or `docker compose restart` |
| Backup DB | `docker exec <db> pg_dump -U energy_pms energy_pms > backup.sql` |
| CMS parity check | `docker exec <backend> python -m app.scripts.check_cms_parity --strict` |
| Force CMS sync now | `docker exec <backend> python -m app.scripts.sync_cms_pages` |

**Recommended env after first deploy:** `AUTO_SEED=false`, `AUTO_SYNC_CMS_PAGES=true` — keeps CMS in sync with code on every redeploy without re-running full product/admin seeds.

---

## 9. Troubleshooting

| Symptom | Fix |
|---------|-----|
| **503 no available server** (containers healthy) | (1) Set frontend domain to **`https://your-domain.com:80`** in Coolify UI. (2) Enable **Connect To Predefined Network** on `frontend`. (3) Confirm `docker inspect` shows `loadbalancer.server.port=80` with your resource UUID in the label key (not `${...}`). (4) On Docker 29+, upgrade Traefik to **v3.6.1** if proxy logs show API errors. |
| **404 / 503 + Traefik log: "cannot be linked automatically with multiple Services"** | Remove duplicate `https-0-...-frontend.loadbalancer.server.port` label; use one service on port 80 and add explicit `traefik.http.routers.*.service=http-0-<uuid>-frontend` labels (see `docker-compose.coolify.yml`). Redeploy frontend, then `docker restart coolify-proxy`. |
| API 502 on `/api/*` | Backend not healthy — check `docker compose logs backend`, DB connection |
| Login works locally but not prod | `REACT_APP_API_URL` / `FRONTEND_URL` mismatch; redeploy frontend |
| CORS errors | Add origin to `CORS_ORIGINS` env var |
| Empty shop images | Run `backfill_media_content --assign-products` once |
| Paystack redirect fails | `FRONTEND_URL` must match public HTTPS URL exactly |

---

## Files reference

| File | Purpose |
|------|---------|
| `docker-compose.coolify.yml` | Production compose for Coolify |
| `.env.coolify.example` | Environment template |
| `backend/Dockerfile.prod` | API image |
| `frontend/Dockerfile.prod` | nginx + React build |
| `frontend/nginx.conf` | Static files + `/api` proxy |

# Local Development & Testing Guide

This project is ready for local development and testing. Use this guide to run the full stack on your machine.

---

## Prerequisites

- **Docker & Docker Compose** – for full stack (backend, frontend, database)
- **Node.js 18+** (optional) – if you prefer running the frontend without Docker
- **Python 3.11+** (optional) – if you prefer running the backend without Docker

---

## Quick Start (Docker – Recommended)

### 1. Create `.env` file

```bash
cp .env.example .env
```

Edit `.env` with at least:

```env
# Database (local Postgres in Docker)
POSTGRES_USER=energy_pms
POSTGRES_PASSWORD=changeme
POSTGRES_DB=energy_pms

# Backend
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256

# Frontend – must be localhost for browser API calls
REACT_APP_API_URL=http://localhost:8000

# Company (optional)
COMPANY_NAME=Energy Precisions
COMPANY_EMAIL=info@energyprecisions.com
```

**Note:** Leave `DATABASE_URL` empty to use the local Postgres container.

### 2. Start the stack

```bash
docker-compose up -d
```

### 3. Initialize the database (first run only)

```bash
# Wait ~10 seconds for Postgres to be ready, then:
docker-compose exec backend alembic upgrade head
docker-compose exec backend python -m app.scripts.init_db
docker-compose exec backend python -m app.scripts.create_default_admin
docker-compose exec backend python -m app.scripts.setup_bank_details
docker-compose exec backend python -m app.scripts.seed_ecommerce_products
```

### 4. Access the app

| Service    | URL                      |
|------------|--------------------------|
| **Frontend** | http://localhost:5000   |
| **Backend API** | http://localhost:8000 |
| **API Docs** | http://localhost:8000/docs |
| **PMS Admin** | http://localhost:5000/pms/admin |
| **Public Site** | http://localhost:5000 |

### 5. Admin credentials

| Field | Value |
|-------|-------|
| **Email** | `admin@energyprecisions.com` |
| **Password** | `admin123` |

---

## Testing Checklist

### PMS (Project Management)

- [ ] Log in at `/pms/admin`
- [ ] Create a customer
- [ ] Create a project
- [ ] Add appliances, run sizing
- [ ] Create a quote, download PDF

### Corporate Website & E-commerce

- [ ] Browse Shop at `/shop`
- [ ] Add product to cart
- [ ] Proceed to checkout (Paystack will need keys for real payments)
- [ ] Test cart persistence (session)

### API

- [ ] Open http://localhost:8000/docs
- [ ] Test `POST /api/auth/login` with admin credentials
- [ ] Test `GET /api/ecommerce/products`

---

## Development Workflow

### Backend hot-reload

Backend runs with `--reload`; code changes apply without rebuild.

### Frontend hot-reload

Frontend runs with `npm start`; code changes apply without rebuild.

### Rebuild after dependency changes

```bash
# Backend
docker-compose up -d --build backend

# Frontend
docker-compose up -d --build frontend
```

### View logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Reset database (clean slate)

```bash
docker-compose down -v
docker-compose up -d
# Wait for DB, then re-run init steps (step 3 above)
```

---

## Running Against Render Database

To test locally but use the production database:

```env
# .env – add or set:
DATABASE_URL=postgresql://user:password@host.oregon-postgres.render.com/dbname?sslmode=require
```

Then start with `docker-compose up -d`. The backend will use the Render DB instead of the local one.

**Warning:** This will modify production data. Prefer a separate staging DB when possible.

---

## Alternative: Without Docker

### Backend only (requires local Postgres)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Set env vars (or use .env)
export POSTGRES_HOST=localhost
export POSTGRES_USER=energy_pms
export POSTGRES_PASSWORD=changeme
export POSTGRES_DB=energy_pms

uvicorn app.main:app --reload --port 8000
```

### Frontend only

```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

Runs at http://localhost:3000. Ensure the backend is running on port 8000.

---

## Troubleshooting

### "Connection refused" to database

- Ensure Postgres is up: `docker-compose ps`
- Check DB logs: `docker-compose logs db`

### CORS errors in browser

- For local dev, CORS allows `http://localhost:3000`, `http://localhost:5000`, etc.
- Confirm `REACT_APP_API_URL` matches the backend URL you are calling.

### Frontend shows "Network Error"

- Confirm backend is running: http://localhost:8000/api/health
- Confirm `REACT_APP_API_URL` is set correctly for your setup

# Services Status & Quick Reference

## ✅ Current Status

**All services are running!**

| Service | Container | Status | Port | URL |
|---------|-----------|--------|------|-----|
| Database | `energy_pms_db` | ✅ Running (healthy) | 5432 | localhost:5432 |
| Backend API | `energy_pms_backend` | ✅ Running | 8000 | http://localhost:8000 |
| Frontend | `energy_pms_frontend` | ✅ Running | 5000 | http://localhost:5000 |

## 🚀 Quick Start Commands

### Start All Services
```bash
./start-services.sh
```

### Manual Start
```bash
docker compose up -d
```

### Stop All Services
```bash
docker compose down
```

### View Service Status
```bash
docker compose ps
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Restart a Service
```bash
docker compose restart backend
docker compose restart frontend
docker compose restart db
```

## 🔧 First-Time Setup (If Needed)

If this is your first run or database is empty:

```bash
# 1. Run database migrations
docker compose exec backend alembic upgrade head

# 2. Initialize default settings
docker compose exec backend python -m app.scripts.init_db

# 3. Create admin user
docker compose exec backend python -m app.scripts.create_admin
```

## 📍 Access Points

- **Frontend UI**: http://localhost:5000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432
  - User: `energy_pms`
  - Password: `changeme` (default)
  - Database: `energy_pms`

## 🛠️ Development Commands

### Access Backend Shell
```bash
docker compose exec backend bash
```

### Access Database Shell
```bash
docker compose exec db psql -U energy_pms -d energy_pms
```

### Run Backend Scripts
```bash
docker compose exec backend python -m app.scripts.init_db
docker compose exec backend python -m app.scripts.create_admin
```

### Rebuild After Changes
```bash
docker compose up -d --build
```

## 🔍 Health Checks

### Check Backend API
```bash
curl http://localhost:8000/docs
```

### Check Database
```bash
docker compose exec db pg_isready -U energy_pms
```

### Check Frontend
```bash
curl http://localhost:5000
```

## 📝 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
POSTGRES_USER=energy_pms
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=energy_pms

# Backend
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Company Info
COMPANY_NAME=Energy Precisions
COMPANY_EMAIL=info@energyprecisions.com
COMPANY_PHONE=+1234567890
COMPANY_ADDRESS=Your Address

# Frontend
REACT_APP_API_URL=http://localhost:8000

# SMTP (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_password
SMTP_FROM_EMAIL=noreply@energyprecisions.com
```

## 🆘 Troubleshooting

### Services Won't Start
1. Check Docker is running: `docker info`
2. Check ports are available:
   - `lsof -i :8000` (Backend)
   - `lsof -i :5000` (Frontend)
   - `lsof -i :5432` (Database)
3. View logs: `docker compose logs`

### Database Connection Issues
1. Wait for database: `docker compose exec db pg_isready`
2. Check credentials in `.env`
3. Verify container is running: `docker compose ps`

### Backend Not Responding
1. Check logs: `docker compose logs backend`
2. Verify environment variables
3. Check database connection

### Frontend Not Loading
1. Check backend is running: `curl http://localhost:8000/docs`
2. Verify `REACT_APP_API_URL` in `.env`
3. Check browser console for errors
4. View logs: `docker compose logs frontend`

## 📊 Service Details

### Database (PostgreSQL)
- **Image**: postgres:15-alpine
- **Volume**: `postgres_data` (persistent)
- **Health Check**: Enabled
- **Data Persistence**: Yes (Docker volume)

### Backend (FastAPI)
- **Framework**: FastAPI with Uvicorn
- **Hot Reload**: Enabled (development)
- **Port**: 8000
- **Dependencies**: Database (waits for healthy DB)

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Hot Reload**: Enabled (development)
- **Port**: 5000 (mapped from 3000)
- **Dependencies**: Backend

## 🔄 Service Dependencies

```
Database (db)
    ↓
Backend (backend) - depends on db
    ↓
Frontend (frontend) - depends on backend
```

Services start in this order automatically.

---

**Last Updated**: January 2025
**Status**: All Services Running ✅

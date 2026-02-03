# Energy Precision PMS - Project Review

## 📋 Project Overview

**Energy Precision PMS** is a comprehensive full-stack solar sizing, load analysis, and quotation system designed for Energy Precisions. The system helps manage the complete workflow from customer onboarding to quote generation.

## 🏗️ Architecture

### Technology Stack

**Backend:**
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **PDF Generation**: WeasyPrint
- **Authentication**: JWT (python-jose)

**Frontend:**
- **Framework**: React 18 with TypeScript
- **UI Library**: Material UI (MUI) v5
- **HTTP Client**: Axios
- **Routing**: React Router v6

**Infrastructure:**
- **Containerization**: Docker & Docker Compose
- **Development**: Hot-reload enabled for both frontend and backend

## 📁 Project Structure

```
EnergyPrecisionPMS/
├── backend/              # FastAPI backend application
│   ├── app/
│   │   ├── routers/     # API route handlers
│   │   ├── services/    # Business logic
│   │   ├── scripts/     # Utility scripts
│   │   └── models.py    # Database models
│   └── alembic/         # Database migrations
│
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/   # API services
│   │   └── contexts/    # React contexts
│   └── public/          # Static assets
│
├── database/            # Database migrations
├── docker-compose.yml   # Docker services configuration
└── start-services.sh    # Service startup script
```

## 🚀 Services

The application consists of **3 main services**:

1. **Database (PostgreSQL)**
   - Container: `energy_pms_db`
   - Port: `5432` (internal)
   - Database: `energy_pms`
   - User: `energy_pms`

2. **Backend API (FastAPI)**
   - Container: `energy_pms_backend`
   - Port: `8000`
   - Endpoint: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`
   - Hot-reload: Enabled

3. **Frontend (React)**
   - Container: `energy_pms_frontend`
   - Port: `5000` (mapped from 3000)
   - Endpoint: `http://localhost:5000`
   - Hot-reload: Enabled

## ✨ Key Features

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Sales, Viewer)
- Protected routes and API endpoints

### 2. Customer Management
- CRUD operations for customers
- Customer types (Residential, Commercial, Industrial)
- Contact information and notes

### 3. Project Management
- Create projects linked to customers
- System types (Grid-tied, Hybrid, Off-grid)
- Project status tracking

### 4. Load Analysis
- **Option A**: Monthly consumption input (kWh or bill amount)
- **Option B**: Detailed appliance-level loads
- Automatic daily kWh calculation
- Duty cycle factors for appliances
- HP to Watts conversion for AC units

### 5. System Sizing
- PV array size calculation
- Panel quantity calculation (Jinko 580W, Longi 570W, JA 560W)
- Inverter sizing based on DC/AC ratio
- Battery sizing for hybrid/off-grid systems
- Roof area estimation
- Location-based peak sun hours lookup

### 6. Pricing Engine
- Admin-configurable product catalog
- Automatic quote line item generation
- Manual price overrides per quote
- Tax and discount calculations

### 7. Quotation Generation
- Professional PDF quotations
- System summary and specifications
- Detailed pricing breakdown
- Company branding

### 8. E-commerce Features
- Product catalog management
- Shopping cart functionality
- Payment processing
- Public-facing website

## 🔧 Engineering Factors

The system implements industry-standard engineering factors:

- **System Efficiency**: 77% (accounts for inverter, wiring, temperature, soiling)
- **DC/AC Ratio**: 1.3 maximum (prevents inverter clipping)
- **Design Factor**: 1.15 (15% safety margin)
- **Battery DoD**: 80% (lithium batteries)
- **Fridge Duty Cycle**: 60%
- **AC Conversion**: 1 HP = 900W

All factors are configurable through the Settings table in the database.

## 📊 Database Schema

### Core Tables
- `users` - User accounts and roles
- `customers` - Customer information
- `projects` - Projects linked to customers
- `appliances` - Appliance details per project
- `sizing_results` - Calculated system specifications
- `products` - Product catalog
- `quotes` - Quotations
- `quote_items` - Line items in quotations
- `settings` - System configuration
- `peak_sun_hours` - Location-specific solar data

## 🚀 Starting Services

### Quick Start (Recommended)

```bash
./start-services.sh
```

### Manual Start

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f [service]
```

### First-Time Setup

If this is your first run:

```bash
# 1. Run database migrations
docker-compose exec backend alembic upgrade head

# 2. Initialize default settings
docker-compose exec backend python -m app.scripts.init_db

# 3. Create admin user
docker-compose exec backend python -m app.scripts.create_admin
```

## 📍 Access Points

- **Frontend UI**: http://localhost:5000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432

## 🛠️ Useful Commands

```bash
# Start services
./start-services.sh
# or
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Restart a service
docker-compose restart backend

# Rebuild after changes
docker-compose up -d --build

# Access backend shell
docker-compose exec backend bash

# Access database
docker-compose exec db psql -U energy_pms -d energy_pms
```

## 📝 Configuration

### Environment Variables

Create a `.env` file in the project root with:

```env
POSTGRES_USER=energy_pms
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=energy_pms
SECRET_KEY=your_jwt_secret_key
REACT_APP_API_URL=http://localhost:8000
COMPANY_NAME=Energy Precisions
COMPANY_EMAIL=info@energyprecisions.com
```

## 🔍 Project Status

### ✅ Completed Features
- Full authentication system
- Customer and project management
- Load analysis (monthly and appliance-based)
- System sizing calculations
- Product catalog management
- Quote generation with PDF export
- E-commerce functionality
- Public website integration

### 📚 Documentation
- Comprehensive README files
- Setup guides
- API documentation (auto-generated)
- Deployment guides
- Calculation explanations

## 🎯 Next Steps

1. **Start Services**: Run `./start-services.sh`
2. **Initialize Database**: Run migrations and init scripts
3. **Create Admin User**: Set up your admin account
4. **Add Products**: Configure your product catalog
5. **Start Using**: Begin creating customers, projects, and quotes

## 🆘 Troubleshooting

### Services won't start
- Check Docker is running: `docker info`
- Check ports are available: `lsof -i :8000` or `lsof -i :5000`
- View logs: `docker-compose logs`

### Database connection issues
- Wait for database to be healthy: `docker-compose exec db pg_isready`
- Check credentials in `.env` file
- Verify database container is running

### Frontend not loading
- Check backend is running: `curl http://localhost:8000/docs`
- Verify `REACT_APP_API_URL` is set correctly
- Check browser console for errors

---

**Last Updated**: January 2025
**Version**: 1.0.0

# Setup Guide - Energy Precision PMS

## Quick Start

1. **Clone or navigate to the project directory**
   ```bash
   cd EnergyPrecisionPMS
   ```

2. **Create environment file**
   ```bash
   # Create .env file with your configuration
   # You can copy and modify the example below
   ```

3. **Start Docker containers**
   ```bash
   docker-compose up -d
   ```

4. **Initialize database**
   ```bash
   # Wait a few seconds for database to be ready
   docker-compose exec backend alembic upgrade head
   docker-compose exec backend python -m app.scripts.init_db
   ```

5. **Create admin user**
   ```bash
   docker-compose exec backend python -m app.scripts.create_admin
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database
POSTGRES_USER=energy_pms
POSTGRES_PASSWORD=changeme
POSTGRES_DB=energy_pms
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Backend
SECRET_KEY=your-secret-key-here-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Frontend
REACT_APP_API_URL=http://localhost:8000

# Email (optional, for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@energyprecisions.com

# Company Info
COMPANY_NAME=Energy Precisions
COMPANY_ADDRESS=Your Company Address
COMPANY_PHONE=+1-234-567-8900
COMPANY_EMAIL=info@energyprecisions.com
```

**Important**: Change the `SECRET_KEY` and `POSTGRES_PASSWORD` before deploying to production!

## Initial Setup Steps

### 1. Add Products to Catalog

After logging in as admin, navigate to the Products page and add:

**Panels:**
- Jinko 580W (price per panel or per watt)
- Longi 570W
- JA 560W

**Inverters:**
- 6.5kW, 8kW, 10kW, 12kW, etc. (price per kW or fixed)

**Batteries:**
- 5kWh, 10kWh, 15kWh, etc. (price per kWh or fixed)

**Services:**
- Mounting Structure (price per kW or per panel)
- Balance of System (BOS) - as percentage or per kW
- Installation (price per kW or fixed)
- Transport & Logistics (fixed price)

### 2. Configure Peak Sun Hours

As admin, you can add location-specific peak sun hours data through the Settings page or API.

### 3. Adjust Engineering Factors

All sizing factors can be adjusted in the Settings page:
- System efficiency (default: 77%)
- Design factor (default: 1.15)
- DC/AC ratio (default: 1.3)
- Panel area and spacing factors
- Battery depth of discharge (default: 80%)
- Appliance duty cycles

## Usage Workflow

1. **Create a Customer**
   - Navigate to Customers page
   - Click "Add Customer"
   - Fill in customer details

2. **Create a Project**
   - Navigate to Projects page
   - Click "New Project"
   - Select customer and system type (Grid-tied/Hybrid/Off-grid)

3. **Add Load Data**
   - Open the project
   - Go to "Load Analysis" tab
   - Option A: Add appliances manually
   - Option B: Use monthly consumption (enter monthly kWh or bill amount)

4. **Calculate System Sizing**
   - Go to "System Sizing" tab
   - Click "Calculate Sizing"
   - Enter location and panel brand
   - For hybrid/off-grid: specify backup hours

5. **Generate Quote**
   - Navigate to Quotes page
   - Create new quote from project
   - System auto-generates line items from sizing
   - Adjust prices, quantities, tax, and discounts as needed

6. **Download PDF**
   - Open the quote
   - Click "Download PDF" to generate and download quotation

## Troubleshooting

### Database Connection Errors
```bash
# Check if database is running
docker-compose ps

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Backend Errors
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend
```

### Migration Issues
```bash
# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d db
# Wait for DB to be ready
docker-compose exec backend alembic upgrade head
docker-compose exec backend python -m app.scripts.init_db
```

## Production Deployment

For production deployment:

1. **Change all default passwords and secrets**
2. **Use strong SECRET_KEY** (generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
3. **Configure proper SMTP settings** for email functionality
4. **Set up SSL/TLS** for HTTPS
5. **Configure proper CORS origins** in backend
6. **Use production database** (not the default PostgreSQL container)
7. **Set up backups** for database
8. **Configure logging** and monitoring
9. **Build production frontend**: `cd frontend && npm run build`
10. **Use production-ready web server** (nginx) for frontend

## Support

For issues or questions, contact the development team.









# Energy Precision PMS - Project Review & Deployment Guide

## 📋 Project Overview

**Energy Precision PMS** is a comprehensive Project Management System for solar energy installations, designed specifically for the Ghana market. The system handles project creation, system sizing, quotation generation, and PDF report generation.

---

## 🏗️ Architecture

### Technology Stack

**Backend:**
- **Framework:** FastAPI (Python 3.11)
- **Database:** PostgreSQL 15
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **PDF Generation:** WeasyPrint + Jinja2
- **Authentication:** JWT (python-jose)

**Frontend:**
- **Framework:** React 18.2 with TypeScript
- **UI Library:** Material-UI (MUI) v5
- **Routing:** React Router v6
- **HTTP Client:** Axios

**Infrastructure:**
- **Containerization:** Docker & Docker Compose
- **Production:** Multi-stage builds with Nginx for frontend
- **Deployment:** Docker Hub + Render.com (or similar)

---

## 📁 Project Structure

```
EnergyPrecisionPMS/
├── backend/
│   ├── app/
│   │   ├── routers/          # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── scripts/          # Utility scripts
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   └── main.py           # FastAPI app
│   ├── alembic/              # Database migrations
│   ├── Dockerfile            # Development
│   ├── Dockerfile.prod       # Production
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/            # React pages
│   │   ├── components/       # Reusable components
│   │   └── services/         # API services
│   ├── Dockerfile            # Development
│   ├── Dockerfile.prod       # Production
│   └── package.json
├── docker-compose.yml        # Development
├── docker-compose.prod.yml   # Production
└── build-and-push.sh        # Docker Hub deployment script
```

---

## 🔑 Key Features

### 1. **System Sizing Engine**
- Calculates PV panel requirements based on daily energy needs
- Determines inverter capacity with DC/AC ratio optimization
- Battery sizing with C-rate and discharge efficiency considerations
- Roof area calculations with spacing factors
- Location-specific peak sun hours integration

### 2. **Quote Management**
- Automatic quote generation from sizing results
- Real-time calculation updates (BOS, Installation, Tax, Discount)
- Editable quote items (description, quantity, unit price)
- PDF quotation generation with professional formatting

### 3. **Product Catalog**
- Predefined products (panels, inverters, batteries)
- Custom product creation
- Ghana-optimized pricing

### 4. **Project Management**
- Customer management
- Project creation with appliance catalog
- System type selection (Grid-Tied, Hybrid, Off-Grid)
- Status tracking

### 5. **Admin Settings**
- Configurable sizing parameters
- Peak sun hours by location
- Default tax and discount percentages
- Company information

---

## 🗄️ Database Schema

### Core Models

1. **User** - Authentication and authorization
2. **Customer** - Customer information
3. **Project** - Solar installation projects
4. **Appliance** - Energy-consuming devices
5. **SizingResult** - Calculated system specifications
6. **Quote** - Quotations with pricing
7. **QuoteItem** - Individual line items in quotes
8. **Product** - Product catalog
9. **Setting** - System configuration
10. **PeakSunHours** - Location-specific solar data

### Key Relationships

- `Project` → `Customer` (many-to-one)
- `Project` → `SizingResult` (one-to-one)
- `Project` → `Quote` (one-to-many)
- `Quote` → `QuoteItem` (one-to-many)
- `QuoteItem` → `Product` (many-to-one, optional)

---

## 🔄 Recent Updates & Improvements

### Battery Sizing Enhancements
- ✅ C-rate consideration for power delivery
- ✅ Battery discharge efficiency (accounts for inverter losses)
- ✅ Automatic battery inclusion for HYBRID/OFF_GRID systems
- ✅ Smart battery selection (16kWh → 10kWh+ → 5kWh)

### Quote Management
- ✅ Real-time BOS and Installation percentage editing
- ✅ Real-time tax and discount percentage editing
- ✅ Automatic recalculation of dependent items
- ✅ Editable quote items (description, quantity, price)

### PDF Generation
- ✅ Professional System Specifications section
- ✅ Engineering Notes, Terms & Conditions, Payment Terms
- ✅ Tax and discount percentage display
- ✅ Dynamic panel brand extraction from quote items

### Data Consistency
- ✅ Comprehensive system verification scripts
- ✅ Automatic consistency fixes
- ✅ Panel brand consistency between sizing and quotes

### Settings & Configuration
- ✅ Battery C-rate and discharge efficiency settings
- ✅ Default tax and discount percentages
- ✅ Peak sun hours management via API
- ✅ Admin interface for all settings

---

## 🐳 Docker Configuration

### Development
- **Backend:** Python 3.11-slim with hot reload
- **Frontend:** Node 18 with development server
- **Database:** PostgreSQL 15 Alpine

### Production
- **Backend:** Python 3.11-slim, no reload
- **Frontend:** Multi-stage build (Node builder + Nginx)
- **Database:** External PostgreSQL (production)

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Review all recent changes
- [ ] Run system verification script
- [ ] Test quote generation and PDF export
- [ ] Verify database migrations are up to date
- [ ] Check environment variables
- [ ] Review security settings

### Docker Hub Push

1. **Login to Docker Hub:**
   ```bash
   docker login
   ```

2. **Build and Push:**
   ```bash
   ./build-and-push.sh <your-dockerhub-username>
   ```

   Or manually:
   ```bash
   # Backend
   docker build --platform linux/amd64 -f backend/Dockerfile.prod \
     -t <username>/energy-pms-backend:latest ./backend
   docker push <username>/energy-pms-backend:latest

   # Frontend
   docker build --platform linux/amd64 -f frontend/Dockerfile.prod \
     -t <username>/energy-pms-frontend:latest ./frontend \
     --build-arg REACT_APP_API_URL=http://localhost:8000
   docker push <username>/energy-pms-frontend:latest
   ```

### Production Database Migration

See `PRODUCTION_DB_MIGRATION.md` for detailed instructions.

**Quick Steps:**
1. Get production database credentials
2. Run migration script: `python backend/app/scripts/migrate_production_db.py`
3. Verify data integrity
4. Update application environment variables

---

## 🔍 System Verification

### Run Comprehensive Check

```bash
# From backend directory
python -m app.scripts.system_verification
```

This checks:
- ✅ Quote calculations accuracy
- ✅ Panel brand consistency
- ✅ API endpoint availability
- ✅ PDF generation
- ✅ Data consistency

### Fix Consistency Issues

```bash
# Automatically fix identified issues
python -m app.scripts.fix_consistency_issues
```

---

## 📊 Key Calculations

### PV Panel Sizing
```
Required DC Power (kW) = (Daily Energy (kWh) / Peak Sun Hours) / System Efficiency
Design DC Power (kW) = Required DC Power × Design Factor
Actual DC Power (kW) = min(Design DC Power, Max DC/AC Ratio × Inverter AC Power)
```

### Battery Sizing
```
Essential Load (kW AC) = (Daily Energy / 24) × Essential Load %
Essential Load (kW DC) = Essential Load (kW AC) / Battery Discharge Efficiency
Battery Capacity (Energy) = (Essential Load DC × Backup Hours) / DOD
Battery Capacity (Power) = Essential Load DC / (C-Rate × DOD)
Battery Capacity = max(Energy Requirement, Power Requirement)
```

### Quote Calculations
```
Equipment Subtotal = Sum of all equipment items
Services Subtotal = Sum of all service items
BOS = Equipment Subtotal × BOS Percentage (default 12%)
Installation = (Equipment + BOS) × Installation Percentage (default 20%)
Tax = (Equipment + Services) × Tax Percentage
Discount = (Equipment + Services) × Discount Percentage
Grand Total = Equipment + Services + Tax - Discount
```

---

## 🔐 Security Considerations

1. **JWT Tokens:** Secure secret key required
2. **Database:** Strong passwords, encrypted connections
3. **CORS:** Configured for production domains
4. **Environment Variables:** Never commit secrets
5. **User Roles:** Admin, Sales, Viewer permissions

---

## 📝 Environment Variables

### Backend
```env
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
POSTGRES_HOST=your_host
POSTGRES_PORT=5432
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM_EMAIL=your_email
COMPANY_NAME=Energy Precisions
COMPANY_ADDRESS=your_address
COMPANY_PHONE=your_phone
COMPANY_EMAIL=your_email
```

### Frontend
```env
REACT_APP_API_URL=https://your-backend-url.com
```

---

## 🐛 Known Issues & Solutions

### Issue: Battery not appearing in new quotes
**Solution:** Fixed - HYBRID/OFF_GRID systems now automatically include batteries

### Issue: Tax/Discount not affecting calculations
**Solution:** Fixed - Proper None handling and explicit value setting

### Issue: Panel brand mismatch in PDF
**Solution:** Fixed - PDF now prioritizes quote items over sizing results

### Issue: Essential Load Percentage showing 10000%
**Solution:** Fixed - Frontend now sends decimal (0.0-1.0) instead of percentage

---

## 📚 Documentation Files

- `README.md` - Main project documentation
- `DEPLOYMENT.md` - Detailed deployment guide
- `QUICK_DEPLOY.md` - Quick deployment steps
- `SETUP.md` - Development setup
- `BATTERY_DISCHARGE_RATE_EXPLANATION.md` - Battery sizing details
- `CALCULATION_EXPLANATION.md` - Calculation formulas

---

## ✅ Pre-Push Verification

Before pushing to Docker Hub, ensure:

1. ✅ All tests pass (if applicable)
2. ✅ Database migrations are up to date
3. ✅ No hardcoded credentials
4. ✅ Environment variables documented
5. ✅ Production Dockerfiles tested locally
6. ✅ Build scripts work correctly
7. ✅ System verification passes

---

## 🎯 Next Steps After Push

1. **Update Production Environment:**
   - Pull latest images
   - Update environment variables
   - Run database migrations
   - Restart services

2. **Verify Deployment:**
   - Test API endpoints
   - Test frontend access
   - Generate test quote PDF
   - Verify calculations

3. **Monitor:**
   - Check application logs
   - Monitor database performance
   - Verify email functionality (if configured)

---

## 📞 Support

For issues or questions:
- Review system verification reports
- Check application logs
- Review database consistency
- Consult documentation files

---

**Last Updated:** $(date)
**Version:** 1.0.0
**Status:** Ready for Production Deployment





# Energy Precision PMS - Project Summary

## Overview

A complete full-stack solar sizing, load analysis, and quotation system built with modern technologies and best practices.

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **PDF Generation**: WeasyPrint
- **Authentication**: JWT (python-jose)

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Material UI (MUI) v5
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL in container
- **Development**: Hot-reload enabled for both frontend and backend

## Project Structure

```
EnergyPrecisionPMS/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── config.py            # Configuration and settings
│   │   ├── database.py          # Database connection and session
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── auth.py              # Authentication utilities
│   │   ├── routers/             # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── customers.py
│   │   │   ├── projects.py
│   │   │   ├── appliances.py
│   │   │   ├── sizing.py
│   │   │   ├── products.py
│   │   │   ├── quotes.py
│   │   │   └── settings.py
│   │   ├── services/            # Business logic
│   │   │   ├── sizing.py        # PV system sizing calculations
│   │   │   ├── load_calculator.py  # Load analysis
│   │   │   ├── pricing.py       # Quote generation
│   │   │   └── pdf_generator.py  # PDF generation
│   │   └── scripts/             # Utility scripts
│   │       ├── create_admin.py
│   │       └── init_db.py
│   ├── alembic/                 # Database migrations
│   ├── Dockerfile
│   ├── requirements.txt
│   └── alembic.ini
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── Layout.tsx
│   │   │   └── PrivateRoute.tsx
│   │   ├── contexts/            # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── pages/               # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Customers.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── Quotes.tsx
│   │   │   ├── QuoteDetail.tsx
│   │   │   ├── Products.tsx
│   │   │   └── Settings.tsx
│   │   ├── services/            # API services
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   ├── types/               # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── README.md
├── SETUP.md
└── .gitignore
```

## Key Features Implemented

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
- Duty cycle factors for appliances (fridge, AC, etc.)
- HP to Watts conversion for AC units and motors

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
- Equipment vs Services categorization

### 7. Quotation Generation
- Professional PDF quotations
- System summary and specifications
- Detailed pricing breakdown
- Company branding
- Download and print functionality

### 8. Settings & Configuration
- Configurable engineering factors
- Peak sun hours database
- System efficiency, DC/AC ratios, etc.
- All factors adjustable through admin interface

## Engineering Accuracy

The system implements industry-standard engineering factors:

- **System Efficiency**: 77% (accounts for inverter, wiring, temperature, soiling)
- **DC/AC Ratio**: 1.3 maximum (prevents inverter clipping)
- **Design Factor**: 1.15 (15% safety margin)
- **Battery DoD**: 80% (lithium batteries)
- **Fridge Duty Cycle**: 60%
- **AC Conversion**: 1 HP = 900W (accounts for compressor efficiency)

All factors are documented in code comments and configurable through the database.

## Database Schema

### Core Tables
- `users` - User accounts and roles
- `customers` - Customer information
- `projects` - Projects linked to customers
- `appliances` - Appliance details per project
- `sizing_results` - Calculated system specifications
- `products` - Product catalog (panels, inverters, batteries, services)
- `quotes` - Quotations
- `quote_items` - Line items in quotations
- `settings` - System configuration
- `peak_sun_hours` - Location-specific solar data

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - Create user (admin only)

### Customers
- `GET /api/customers/` - List customers
- `POST /api/customers/` - Create customer
- `GET /api/customers/{id}` - Get customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Projects
- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `GET /api/projects/{id}` - Get project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Appliances
- `GET /api/appliances/?project_id={id}` - List appliances
- `POST /api/appliances/` - Add appliance
- `PUT /api/appliances/{id}` - Update appliance
- `DELETE /api/appliances/{id}` - Delete appliance

### Sizing
- `POST /api/sizing/calculate` - Calculate sizing from inputs
- `POST /api/sizing/from-appliances/{project_id}` - Calculate from appliances
- `POST /api/sizing/from-monthly` - Calculate from monthly consumption
- `GET /api/sizing/project/{project_id}` - Get sizing result

### Products
- `GET /api/products/` - List products
- `POST /api/products/` - Create product (admin only)
- `PUT /api/products/{id}` - Update product (admin only)
- `DELETE /api/products/{id}` - Delete product (admin only)

### Quotes
- `GET /api/quotes/` - List quotes
- `POST /api/quotes/` - Create quote
- `GET /api/quotes/{id}` - Get quote
- `GET /api/quotes/{id}/pdf` - Download PDF
- `PUT /api/quotes/{id}` - Update quote
- `DELETE /api/quotes/{id}` - Delete quote

### Settings
- `GET /api/settings/` - List settings
- `PUT /api/settings/{key}` - Update setting (admin only)

## Next Steps for Production

1. **Security**
   - Change all default passwords
   - Use strong SECRET_KEY
   - Enable HTTPS
   - Configure proper CORS

2. **Performance**
   - Add database indexes for frequently queried fields
   - Implement caching for settings and peak sun hours
   - Optimize PDF generation for large quotes

3. **Features**
   - Email sending functionality
   - Advanced reporting and analytics
   - Export to Excel/CSV
   - Multi-currency support
   - Quote templates
   - Customer portal

4. **Monitoring**
   - Add logging infrastructure
   - Set up error tracking
   - Performance monitoring
   - Database backups

## Development Notes

- The application uses hot-reload in development mode
- Database migrations are managed with Alembic
- All engineering factors are configurable through the Settings table
- The frontend proxies API requests through the React dev server
- PDF generation uses WeasyPrint which requires system fonts

## License

Proprietary - Energy Precisions









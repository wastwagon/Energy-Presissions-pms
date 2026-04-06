# Energy Precision PMS - Solar Sizing & Quotation System

A comprehensive full-stack solar sizing, load analysis, and quotation system for Energy Precisions.

## Architecture

- **Backend**: FastAPI (Python) - REST API for calculations, pricing, and PDF generation
- **Frontend**: React with TypeScript and Material UI
- **Database**: PostgreSQL
- **Containerization**: Docker & Docker Compose

## Engineering Factors & Assumptions

### PV System Efficiency
- **Overall System Efficiency**: 75-80% (0.75-0.8)
  - Accounts for inverter efficiency (~95%), wiring losses (~2%), temperature effects (~5-10%), and soiling (~2-5%)
  - Default: 0.77 (77%)

### DC/AC Ratio
- **Maximum DC/AC Ratio**: 1.2-1.3
  - Industry standard to prevent inverter clipping
  - Default: 1.3

### Peak Sun Hours
- Location-specific data stored in database
- Examples:
  - Arizona: 6.5-7.0 hours
  - California: 5.5-6.5 hours
  - New York: 3.5-4.5 hours
  - Texas: 5.0-6.0 hours
  - Florida: 5.0-5.5 hours

### Appliance Duty Cycles
- **Refrigerator/Freezer**: 50-70% (default: 0.6)
  - Accounts for compressor cycling
- **AC Units**: Based on HP rating and usage hours
  - 1 HP ≈ 900W for air conditioning (accounts for compressor efficiency)

### Panel Specifications
- **Jinko**: 580W
- **Longi**: 570W
- **JA**: 560W
- **Panel Area**: ~2.6 m² per panel (configurable)
- **Spacing Factor**: 1.1-1.2 (accounts for mounting structure spacing)

### Battery Sizing
- **Depth of Discharge**: 80% (0.8) - standard for lithium batteries
- **Minimum Battery Size**: 5 kWh
- **Rounding**: Nearest multiple of 5 kWh

All factors are configurable through the Settings table in the database.

## Getting Started

### Prerequisites
- Docker and Docker Compose installed

### Running the Application

1. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

2. Start all services:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. Initialize database (first run):
   ```bash
   # Wait for database to be ready, then run migrations
   docker-compose exec backend alembic upgrade head
   
   # Initialize default settings and sample data
   docker-compose exec backend python -m app.scripts.init_db
   ```

5. Create admin user (interactive prompts):
   ```bash
   docker-compose exec backend python -m app.scripts.create_admin
   ```
   Or a one-shot default admin (development only — change the password immediately):
   ```bash
   docker-compose exec backend python -m app.scripts.create_default_admin
   ```

6. (Optional) Add sample products to catalog:
   - Log in as admin
   - Navigate to Products page
   - Add your panel brands (Jinko 580W, Longi 570W, JA 560W)
   - Add inverters (6.5kW, 8kW, 10kW, etc.)
   - Add batteries (5kWh, 10kWh, etc.)
   - Add mounting, BOS, installation, and transport products

## Development

### Backend
- Located in `backend/`
- FastAPI application with SQLAlchemy ORM
- Alembic for database migrations

### Frontend
- Located in `frontend/`
- React with TypeScript
- Material UI components
- Production Docker image uses `frontend/nginx.conf`: `/robots.txt` and `/sitemap.xml` are served as static files from the build output (correct `Content-Type`), not the SPA `index.html`. After changing SEO files or adding routes, rebuild and redeploy the frontend.
- The marketing site is the default at `/`. Staff PMS sign-in is at `/pms/admin` (bookmark or type the URL; it is not linked from the public header). Per-route titles and meta tags use `react-helmet-async` (`Seo` in `frontend/src/components/Seo.tsx`).

### Configuration (e-commerce & contact)

| Variable | Purpose |
|----------|---------|
| `FRONTEND_URL` | Paystack return URL base (e.g. `http://localhost:5000` locally). |
| `ADMIN_EMAIL` | Receives contact form submissions and new-order alerts. |
| `ECOMMERCE_SHIPPING_FLAT_GHS` | Shipping charge when below free-shipping threshold (default `0`). |
| `ECOMMERCE_FREE_SHIPPING_THRESHOLD_GHS` | Subtotal (GHS) for free shipping (default `5000`; set `0` to disable the rule). |
| `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` | Payment integration. |
| `AUTH_DEBUG_LOG` | Set to `true` only when debugging login issues (extra logs). |

Checkout discounts are applied only via **`coupon_code`** on the order API; the client `discount_amount` field is ignored. Use **Coupons** in the database (see e-commerce migrations) and the checkout **Apply** control.

After pulling changes, run migrations (includes `contact_inquiries` and a merge revision if you had split Alembic heads):

```bash
docker-compose exec backend alembic upgrade head
```

In the PMS, admins can open **Contact leads** (`/pms/contact-leads`) to view website form submissions and **Promo codes** (`/pms/promo-codes`) to manage shop checkout coupons.

## Features

### Load Analysis
- **Monthly Consumption**: Enter monthly kWh or bill amount with tariff
- **Detailed Appliances**: Add appliances with power ratings, quantities, and usage hours
- **Automatic Calculations**: Daily kWh calculated with duty cycles and unit conversions
- **Essential Loads**: Mark appliances as essential for backup sizing

### System Sizing
- **PV Array Sizing**: Calculates system size based on daily energy needs and peak sun hours
- **Panel Selection**: Support for Jinko 580W, Longi 570W, and JA 560W panels
- **Inverter Sizing**: Automatic inverter selection based on DC/AC ratio
- **Battery Sizing**: Calculates battery capacity for hybrid/off-grid systems
- **Roof Area**: Estimates required roof area with spacing factors

### Pricing & Quotations
- **Product Catalog**: Admin-configurable catalog of panels, inverters, batteries, and services
- **Auto-Generated Quotes**: Automatically creates line items from sizing results
- **Manual Overrides**: Adjust quantities, prices, and add custom items per quote
- **Tax & Discounts**: Configurable tax percentage and discount per quote
- **PDF Generation**: Professional quotation PDFs with company branding

### Reports
- **Quote Management**: List, filter, and manage all quotations
- **Customer Management**: Track customer information and project history
- **Project Tracking**: Monitor project status from new to installed

## API Endpoints

The backend API is documented at http://localhost:8000/docs when running locally.

Key endpoints:
- `/api/auth/login` - User authentication
- `/api/customers/` - Customer CRUD
- `/api/projects/` - Project CRUD
- `/api/appliances/` - Appliance management
- `/api/sizing/` - System sizing calculations
- `/api/products/` - Product catalog (admin only)
- `/api/quotes/` - Quote management and PDF generation
- `/api/settings/` - System settings (admin only)

## Configuration

All engineering factors are stored in the database Settings table and can be adjusted through the admin interface:
- System efficiency
- DC/AC ratio limits
- Panel area and spacing factors
- Battery depth of discharge
- Appliance duty cycles
- HP to Watts conversion factors

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check database credentials in `.env` file
- Verify database is healthy: `docker-compose exec db pg_isready`

### Backend Issues
- Check logs: `docker-compose logs backend`
- Verify environment variables are set correctly
- Ensure database migrations have run

### Frontend Issues
- Check logs: `docker-compose logs frontend`
- Verify `REACT_APP_API_URL` is set correctly
- Clear browser cache if experiencing authentication issues

## License

Proprietary - Energy Precisions


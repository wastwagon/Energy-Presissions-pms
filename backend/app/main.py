from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File
from pathlib import Path
import os
import logging
from contextlib import asynccontextmanager
from app.database import engine, Base
# Import e-commerce models to register them
from app import models_ecommerce
from app.routers import auth, customers, projects, appliances, sizing, products, quotes, settings, reports, dashboard, users
from app.routers import ecommerce, payments, media, newsletter

logger = logging.getLogger(__name__)


def _run_migrations():
    """Run Alembic migrations on startup"""
    try:
        from alembic import command
        from alembic.config import Config
        alembic_cfg = Config(str(Path(__file__).parent.parent / "alembic.ini"))
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations applied successfully")
    except Exception as e:
        if "already exists" in str(e) or "DuplicateColumn" in str(e):
            try:
                from alembic import command
                from alembic.config import Config
                alembic_cfg = Config(str(Path(__file__).parent.parent / "alembic.ini"))
                command.stamp(alembic_cfg, "head")
                logger.info("Database stamped to head (migrations already applied)")
            except Exception:
                pass
        else:
            logger.warning("Migration skipped or failed: %s", e)


def _run_init_and_seed():
    """Run init_db and seed scripts (idempotent)"""
    try:
        from app.scripts.init_db import init_settings, init_peak_sun_hours
        init_settings()
        init_peak_sun_hours()
        logger.info("Init DB (settings, peak sun hours) complete")
    except Exception as e:
        logger.warning("Init DB skipped: %s", e)
    if os.environ.get("AUTO_SEED", "true").lower() in ("true", "1", "yes"):
        try:
            import subprocess
            import sys
            backend_dir = Path(__file__).parent.parent
            subprocess.run([sys.executable, "scripts/seed_production.py"], cwd=str(backend_dir), check=False, capture_output=True)
            subprocess.run([sys.executable, "-m", "app.scripts.seed_ecommerce_products"], cwd=str(backend_dir), check=False, capture_output=True)
            logger.info("Seed scripts completed")
        except Exception as e:
            logger.warning("Seed skipped: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run migrations and seed on startup"""
    _run_migrations()
    _run_init_and_seed()
    yield


# Create database tables (fallback if migrations don't create them)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Energy Precision PMS API",
    description="Solar Sizing, Load Analysis, and Quotation System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration - env CORS_ORIGINS overrides; else use defaults (localhost + production)
# allow_origin_regex matches Render subdomains (e.g. energy-pms-frontend-0m3k.onrender.com)
cors_origins_env = os.getenv("CORS_ORIGINS", "").strip()
if cors_origins_env:
    cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
    cors_origin_regex = None  # Explicit list takes precedence
else:
    cors_origins = [
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
        "https://energyprecisions.com",
        "https://www.energyprecisions.com",
        "http://energyprecisions.com",
        "http://www.energyprecisions.com",
    ]
    # Allow any Render frontend subdomain when CORS_ORIGINS not set
    cors_origin_regex = r"https://energy-pms-frontend-[a-z0-9]+\.onrender\.com"

cors_kwargs = dict(
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
if cors_origin_regex:
    cors_kwargs["allow_origin_regex"] = cors_origin_regex

app.add_middleware(CORSMiddleware, allow_origins=cors_origins, **cors_kwargs)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(appliances.router, prefix="/api")
app.include_router(sizing.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(quotes.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(ecommerce.router)  # E-commerce routes (already has /api/ecommerce prefix)
app.include_router(payments.router)  # Payment routes (already has /api/payments prefix)
app.include_router(media.router, prefix="/api")
app.include_router(newsletter.router)

# Create static directory if it doesn't exist
static_dir = Path("static")
static_dir.mkdir(exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def root():
    return {"message": "Energy Precision PMS API", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


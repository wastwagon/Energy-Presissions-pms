from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File
from pathlib import Path
import os
import logging
from contextlib import asynccontextmanager
from sqlalchemy import inspect, text
from app.database import engine, Base
from app.storage import get_static_root
# Import e-commerce models to register them
from app import models_ecommerce
from app.routers import auth, customers, projects, appliances, sizing, products, quotes, settings, reports, dashboard, users
from app.routers import ecommerce, payments, media, newsletter, contact, content, public_load

logger = logging.getLogger(__name__)


def _ensure_media_columns():
    """Self-heal media schema when migrations were stamped but not fully applied."""
    try:
        insp = inspect(engine)
        table_names = set(insp.get_table_names())
        if "media_items" not in table_names:
            return
        existing_cols = {col["name"] for col in insp.get_columns("media_items")}
        with engine.begin() as conn:
            dialect = conn.dialect.name
            if "content" not in existing_cols:
                if dialect == "postgresql":
                    conn.execute(text("ALTER TABLE media_items ADD COLUMN IF NOT EXISTS content BYTEA"))
                else:
                    conn.execute(text("ALTER TABLE media_items ADD COLUMN content BLOB"))
                logger.info("Added missing media_items.content column")
            if "original_filename" not in existing_cols:
                if dialect == "postgresql":
                    conn.execute(text("ALTER TABLE media_items ADD COLUMN IF NOT EXISTS original_filename VARCHAR"))
                else:
                    conn.execute(text("ALTER TABLE media_items ADD COLUMN original_filename VARCHAR"))
                logger.info("Added missing media_items.original_filename column")
    except Exception as e:
        logger.warning("Media schema self-heal skipped: %s", e)


def _ensure_quote_options_schema():
    """Self-heal quote_options migration when alembic was stamped but DDL partially applied."""
    try:
        insp = inspect(engine)
        table_names = set(insp.get_table_names())
        if "quotes" not in table_names:
            return

        with engine.begin() as conn:
            dialect = conn.dialect.name
            quote_cols = {col["name"] for col in insp.get_columns("quotes")}

            if "accepted_quote_option_id" not in quote_cols and "quote_options" in table_names:
                if dialect == "postgresql":
                    conn.execute(
                        text(
                            "ALTER TABLE quotes ADD COLUMN IF NOT EXISTS "
                            "accepted_quote_option_id INTEGER"
                        )
                    )
                else:
                    conn.execute(
                        text("ALTER TABLE quotes ADD COLUMN accepted_quote_option_id INTEGER")
                    )
                conn.execute(
                    text(
                        "ALTER TABLE quotes ADD CONSTRAINT quotes_accepted_quote_option_id_fkey "
                        "FOREIGN KEY (accepted_quote_option_id) REFERENCES quote_options(id)"
                    )
                )
                logger.info("Added missing quotes.accepted_quote_option_id column")

            if "quote_items" not in table_names or "quote_options" not in table_names:
                return

            item_cols = {col["name"] for col in insp.get_columns("quote_items")}
            if "quote_option_id" in item_cols:
                return

            if dialect == "postgresql":
                conn.execute(
                    text("ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS quote_option_id INTEGER")
                )
            else:
                conn.execute(text("ALTER TABLE quote_items ADD COLUMN quote_option_id INTEGER"))

            item_count = conn.execute(text("SELECT COUNT(*) FROM quote_items")).scalar() or 0
            if item_count:
                conn.execute(
                    text(
                        """
                        INSERT INTO quote_options (quote_id, title, narrative, sort_order)
                        SELECT q.id, 'Option 1', NULL, 0
                        FROM quotes q
                        WHERE NOT EXISTS (
                            SELECT 1 FROM quote_options qo
                            WHERE qo.quote_id = q.id AND qo.sort_order = 0
                        )
                        """
                    )
                )
                conn.execute(
                    text(
                        """
                        UPDATE quote_items AS qi
                        SET quote_option_id = qo.id
                        FROM quote_options AS qo
                        WHERE qi.quote_id = qo.quote_id AND qo.sort_order = 0
                          AND qi.quote_option_id IS NULL
                        """
                    )
                )

            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS ix_quote_items_quote_option_id "
                    "ON quote_items (quote_option_id)"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE quote_items ADD CONSTRAINT quote_items_quote_option_id_fkey "
                    "FOREIGN KEY (quote_option_id) REFERENCES quote_options(id) ON DELETE CASCADE"
                )
            )
            if item_count:
                conn.execute(
                    text("ALTER TABLE quote_items ALTER COLUMN quote_option_id SET NOT NULL")
                )
            logger.info("Added missing quote_items.quote_option_id column")
    except Exception as e:
        logger.warning("Quote options schema self-heal skipped: %s", e)


def _ensure_sizing_mounting_columns():
    """Self-heal mounting rail columns when merge migration was stamped but not applied."""
    try:
        insp = inspect(engine)
        if "sizing_results" not in set(insp.get_table_names()):
            return
        existing_cols = {col["name"] for col in insp.get_columns("sizing_results")}
        with engine.begin() as conn:
            dialect = conn.dialect.name
            if "mounting_rail_linear_m_estimate" not in existing_cols:
                if dialect == "postgresql":
                    conn.execute(
                        text(
                            "ALTER TABLE sizing_results ADD COLUMN IF NOT EXISTS "
                            "mounting_rail_linear_m_estimate DOUBLE PRECISION"
                        )
                    )
                else:
                    conn.execute(
                        text(
                            "ALTER TABLE sizing_results ADD COLUMN "
                            "mounting_rail_linear_m_estimate FLOAT"
                        )
                    )
                logger.info("Added missing sizing_results.mounting_rail_linear_m_estimate column")
            if "mounting_rails_estimate" not in existing_cols:
                if dialect == "postgresql":
                    conn.execute(
                        text(
                            "ALTER TABLE sizing_results ADD COLUMN IF NOT EXISTS "
                            "mounting_rails_estimate INTEGER"
                        )
                    )
                else:
                    conn.execute(
                        text("ALTER TABLE sizing_results ADD COLUMN mounting_rails_estimate INTEGER")
                    )
                logger.info("Added missing sizing_results.mounting_rails_estimate column")
            if "dc_string_count" not in existing_cols:
                if dialect == "postgresql":
                    conn.execute(
                        text(
                            "ALTER TABLE sizing_results ADD COLUMN IF NOT EXISTS "
                            "dc_string_count INTEGER"
                        )
                    )
                else:
                    conn.execute(
                        text("ALTER TABLE sizing_results ADD COLUMN dc_string_count INTEGER")
                    )
                logger.info("Added missing sizing_results.dc_string_count column")
    except Exception as e:
        logger.warning("Sizing mounting schema self-heal skipped: %s", e)


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
            pr = subprocess.run(
                [sys.executable, "-m", "app.scripts.seed_proforma_catalog_items"],
                cwd=str(backend_dir),
                check=False,
                capture_output=True,
            )
            if pr.returncode != 0:
                logger.warning(
                    "seed_proforma_catalog_items exit=%s stderr=%s",
                    pr.returncode,
                    (pr.stderr or b"").decode("utf-8", errors="replace")[:800],
                )
            logger.info("Seed scripts completed (production admin, ecommerce products, proforma catalog BOM)")
        except Exception as e:
            logger.warning("Seed skipped: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run migrations and seed on startup"""
    _run_migrations()
    _ensure_media_columns()
    _ensure_quote_options_schema()
    _ensure_sizing_mounting_columns()
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

# CORS: keep safe defaults (localhost + production), merge CORS_ORIGINS from env
# so production is never locked out by an incomplete env list, and allow
# Render-hosted frontend URLs via allow_origin_regex.
default_cors_origins = [
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

cors_origins_env = os.getenv("CORS_ORIGINS", "").strip()
env_cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()] if cors_origins_env else []

# Use dict.fromkeys to preserve order while deduplicating entries.
cors_origins = list(dict.fromkeys(default_cors_origins + env_cors_origins))
cors_origin_regex = r"https://([a-z0-9-]+\.)?onrender\.com"

cors_kwargs = dict(
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
if cors_origin_regex:
    cors_kwargs["allow_origin_regex"] = cors_origin_regex


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
# CORS outermost so error responses still include Access-Control-Allow-Origin.
app.add_middleware(CORSMiddleware, allow_origins=cors_origins, **cors_kwargs)
logger.info("CORS configured with %d explicit origins", len(cors_origins))


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Log server errors; CORSMiddleware still adds ACAO for allowed origins."""
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


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
app.include_router(contact.router)
app.include_router(content.router)
app.include_router(public_load.router)

# Create static directory if it doesn't exist
static_dir = get_static_root()
static_dir.mkdir(parents=True, exist_ok=True)
logger.info("Static files directory: %s", static_dir.resolve())

# Mount static files
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/")
async def root():
    return {"message": "Energy Precision PMS API", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


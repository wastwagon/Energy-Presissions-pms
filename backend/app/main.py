from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File
from pathlib import Path
import os
from app.database import engine, Base
# Import e-commerce models to register them
from app import models_ecommerce
from app.routers import auth, customers, projects, appliances, sizing, products, quotes, settings, reports, dashboard
from app.routers import ecommerce, payments

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Energy Precision PMS API",
    description="Solar Sizing, Load Analysis, and Quotation System",
    version="1.0.0"
)

# CORS configuration - env CORS_ORIGINS overrides; else use defaults (localhost + production)
cors_origins_env = os.getenv("CORS_ORIGINS", "").strip()
if cors_origins_env:
    cors_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(appliances.router, prefix="/api")
app.include_router(sizing.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(quotes.router, prefix="/api")
app.include_router(settings.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(ecommerce.router)  # E-commerce routes (already has /api/ecommerce prefix)
app.include_router(payments.router)  # Payment routes (already has /api/payments prefix)

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


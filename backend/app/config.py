from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database: use DATABASE_URL (e.g. from Render) if set, else POSTGRES_* components
    DATABASE_URL: Optional[str] = None
    POSTGRES_USER: str = "energy_pms"
    POSTGRES_PASSWORD: str = "changeme"
    POSTGRES_DB: str = "energy_pms"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    
    # JWT
    SECRET_KEY: str = "changeme-secret-key-for-jwt-tokens"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # Email
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None
    
    # Company Info
    COMPANY_NAME: str = "Energy Precisions"
    COMPANY_ADDRESS: Optional[str] = None
    COMPANY_PHONE: Optional[str] = None
    COMPANY_EMAIL: Optional[str] = None
    FRONTEND_URL: str = "https://energyprecisions.com"  # For Paystack callback; use http://localhost:5000 locally
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()









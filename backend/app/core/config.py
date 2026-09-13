"""Centralized Application Configuration.

Uses Pydantic BaseSettings to read configuration from environment variables
with strict typing and default values.
"""

from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """SecArena Application Settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # General Application Settings
    APP_NAME: str = "SecArena"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database Configuration
    DATABASE_URL: str = "postgresql+psycopg2://secarena_user:secarena_password@localhost:5432/secarena_db"

    # Security Configuration
    SECRET_KEY: str = "secarena-dev-secret-key-change-this-in-production-min-32-chars"
    JWT_SECRET_KEY: str = "secarena-dev-secret-key-change-this-in-production-min-32-chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    JWT_ALGORITHM: str = "HS256"

    # CORS / Frontend Integration
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]



# Instantiate global settings singleton
settings = Settings()

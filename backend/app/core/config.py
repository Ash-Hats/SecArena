"""Centralized Application Configuration.

Uses Pydantic BaseSettings to read configuration from environment variables
with strict typing and default values.
"""

from typing import List
from pydantic import field_validator
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
    DATABASE_URL: str = "sqlite:///./secarena.db"

    # Security Configuration
    SECRET_KEY: str = ""
    JWT_SECRET_KEY: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    JWT_ALGORITHM: str = "HS256"

    # CORS / Frontend Integration
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def normalize_debug(cls, value):
        if isinstance(value, str) and value.lower() in {"release", "production", "prod"}:
            return False
        return value

    def model_post_init(self, __context) -> None:
        if self.DATABASE_URL.startswith("postgres://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
        elif self.DATABASE_URL.startswith("postgresql://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

        if self.ENVIRONMENT.lower() in {"production", "prod"}:
            required = {"SECRET_KEY": self.SECRET_KEY, "JWT_SECRET_KEY": self.JWT_SECRET_KEY, "CORS_ORIGINS": self.CORS_ORIGINS}
            missing = [
                name for name, value in required.items()
                if not value
                or (name in {"SECRET_KEY", "JWT_SECRET_KEY"} and (
                    value.startswith("secarena-dev-") or value.startswith("<")
                ))
            ]
            if missing:
                raise ValueError(f"Missing required production settings: {', '.join(missing)}")
            if self.DATABASE_URL.startswith("sqlite"):
                raise ValueError("Production DATABASE_URL must use PostgreSQL.")

    @property
    def cors_origins_list(self) -> List[str]:
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return origins



# Instantiate global settings singleton
settings = Settings()

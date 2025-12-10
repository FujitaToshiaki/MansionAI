"""Configuration settings for all services."""

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "postgresql://localhost:5432/mansionai"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # API Keys
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

    # Service URLs (for inter-service communication)
    ocr_service_url: str = "http://localhost:8001"
    knowledge_service_url: str = "http://localhost:8002"
    analysis_service_url: str = "http://localhost:8003"

    # CORS
    cors_origins: str = "*"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Logging
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

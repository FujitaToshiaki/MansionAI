"""Database connection utilities."""

import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from ..models.database import Base


def get_db_url() -> str:
    """Get database URL from environment variable."""
    return os.environ.get("DATABASE_URL", "postgresql://localhost:5432/mansionai")


def create_engine_from_url(url: str = None):
    """Create SQLAlchemy engine from URL."""
    if url is None:
        url = get_db_url()
    return create_engine(url, pool_pre_ping=True)


# Default engine and session factory
_engine = None
_SessionLocal = None


def get_session_factory():
    """Get or create session factory."""
    global _engine, _SessionLocal
    if _engine is None:
        _engine = create_engine_from_url()
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    return _SessionLocal


def get_db() -> Generator[Session, None, None]:
    """Dependency for getting database session."""
    SessionLocal = get_session_factory()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    engine = create_engine_from_url()
    Base.metadata.create_all(bind=engine)

"""API Gateway Service - Main entry point."""

import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add shared module to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from shared.utils.config import get_settings

from .routers import (
    condominiums,
    dashboard,
    decisions,
    documents,
    knowledge,
    regulations,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print("API Gateway starting up...")
    yield
    # Shutdown
    print("API Gateway shutting down...")


app = FastAPI(
    title="MansionAI API Gateway",
    description="API Gateway for MansionAI Python Backend Microservices",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(",") if settings.cors_origins != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(condominiums.router, prefix="/api", tags=["Condominiums"])
app.include_router(documents.router, prefix="/api", tags=["Documents"])
app.include_router(decisions.router, prefix="/api", tags=["Decisions"])
app.include_router(regulations.router, prefix="/api", tags=["Regulations"])
app.include_router(knowledge.router, prefix="/api", tags=["Knowledge"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "MansionAI API Gateway", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
    )

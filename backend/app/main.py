"""SecArena FastAPI Main Entrypoint and Application Factory."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.api.v1.router import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan event handler (startup and shutdown)."""
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME} backend service...")
    yield
    logger.info(f"Shutting down {settings.APP_NAME} backend service...")


def create_app() -> FastAPI:
    """FastAPI Application Factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="SecArena — An Isolated Cyber Attack Simulation and Defense Training Platform API",
        version="0.1.0",
        debug=settings.DEBUG,
        lifespan=lifespan,
    )

    # Configure CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Root Endpoint
    @app.get(
        "/",
        summary="Platform Root",
        description="Returns platform identification and running state.",
        tags=["Root"],
    )
    async def get_root():
        return {
            "name": "SecArena",
            "status": "running",
        }

    # Mount API v1 Router
    app.include_router(api_v1_router, prefix="/api/v1")

    return app


app = create_app()

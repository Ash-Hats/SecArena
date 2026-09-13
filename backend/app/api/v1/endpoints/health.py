"""Health Check API Endpoint."""

from fastapi import APIRouter, status
from app.schemas.health import HealthCheckResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="API Health Status",
    description="Returns current operational health status of SecArena API v1.",
)
async def get_health_status() -> HealthCheckResponse:
    """Returns status indicator for platform health monitoring."""
    return HealthCheckResponse(
        status="healthy",
        service="SecArena API",
    )

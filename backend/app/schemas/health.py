"""Pydantic Schemas for Health Check Endpoint."""

from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    """Health check response payload schema."""

    status: str = Field(..., description="Service status indicator", json_schema_extra={"example": "healthy"})
    service: str = Field(..., description="Name of the service", json_schema_extra={"example": "SecArena API"})


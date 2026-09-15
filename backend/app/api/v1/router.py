"""API v1 Router Aggregator."""

from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, dashboard, labs, admin, events, simulations, custom_commands

api_v1_router = APIRouter()

# Include endpoint routers
api_v1_router.include_router(health.router, tags=["Health"])
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_v1_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_v1_router.include_router(labs.router, prefix="/labs", tags=["Labs"])
api_v1_router.include_router(events.router, prefix="/events", tags=["Training Events"])
api_v1_router.include_router(simulations.router, prefix="/simulations", tags=["Simulations"])

api_v1_router.include_router(admin.router, prefix="/admin", tags=["Administration"])
api_v1_router.include_router(custom_commands.router, prefix="/admin/commands", tags=["Custom Commands"])

from fastapi import APIRouter

from app.core.config import settings
from app.routers import admin, auth, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(admin.router)


@api_router.get("/health", tags=["system"], summary="Service health probe")
def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.environment}

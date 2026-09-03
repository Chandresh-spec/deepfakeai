"""
API v1 router — aggregates all endpoint sub-routers.
Phase 1: health endpoint only.
"""

from fastapi import APIRouter
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.media import router as media_router
from app.api.v1.endpoints.analysis import router as analysis_router

router = APIRouter(prefix="/api/v1")

router.include_router(auth_router)
router.include_router(media_router)
router.include_router(analysis_router)


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "0.1.0",
        "service": "Deepfake & Media Forensics Platform",
    }

"""
Health check endpoints.
"""

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.schemas.common import HealthResponse

router = APIRouter()
settings = get_settings()


@router.get("/health", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check endpoint.
    Returns service status and connectivity info.
    """
    db_connected = False
    sf_connected = False
    
    # Check database connection
    try:
        await db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        pass
    
    # Check Salesforce credentials configured
    sf_connected = bool(
        settings.salesforce_client_id and 
        settings.salesforce_username
    )
    
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        database_connected=db_connected,
        salesforce_connected=sf_connected,
    )


@router.get("/health/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    Kubernetes-style readiness probe.
    Returns 200 if service is ready to accept traffic.
    """
    try:
        await db.execute(text("SELECT 1"))
        return {"ready": True}
    except Exception as e:
        return {"ready": False, "reason": str(e)}


@router.get("/health/live")
async def liveness_check():
    """
    Kubernetes-style liveness probe.
    Returns 200 if service is alive.
    """
    return {"alive": True}

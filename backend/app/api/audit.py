"""
Audit log API routes.
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.audit import AuditLog
from app.schemas.audit import AuditLogEntry, AuditLogResponse, AuditStatsResponse

router = APIRouter()


@router.get("/logs", response_model=AuditLogResponse)
async def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    action: Optional[str] = Query(None),
    user_role: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Get audit logs (admin only).
    Supports pagination and filtering.
    """
    try:
        # Build query
        query = select(AuditLog).order_by(AuditLog.created_at.desc())
        count_query = select(func.count(AuditLog.id))
        
        if action:
            query = query.where(AuditLog.action == action)
            count_query = count_query.where(AuditLog.action == action)
        
        if user_role:
            query = query.where(AuditLog.user_role == user_role)
            count_query = count_query.where(AuditLog.user_role == user_role)
        
        # Pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)
        
        # Execute
        result = await db.execute(query)
        logs = result.scalars().all()
        
        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0
        
        return AuditLogResponse(
            logs=[
                AuditLogEntry(
                    id=log.id,
                    timestamp=log.created_at,
                    user_id=log.user_id,
                    user_role=log.user_role,
                    action=log.action,
                    endpoint=log.endpoint,
                    request_context=log.request_context,
                    retrieved_sources=log.retrieved_sources,
                    response_summary=log.response_summary,
                    success=log.success,
                    error_message=log.error_message,
                    response_time_ms=log.response_time_ms,
                    tokens_used=log.tokens_used,
                )
                for log in logs
            ],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size if total > 0 else 1,
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=AuditStatsResponse)
async def get_audit_stats(
    db: AsyncSession = Depends(get_db),
):
    """
    Get aggregated audit statistics (admin only).
    """
    try:
        # Total requests
        total_result = await db.execute(select(func.count(AuditLog.id)))
        total = total_result.scalar() or 0
        
        # Today's requests
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_result = await db.execute(
            select(func.count(AuditLog.id)).where(AuditLog.created_at >= today_start)
        )
        today = today_result.scalar() or 0
        
        # Average response time
        avg_time_result = await db.execute(
            select(func.avg(AuditLog.response_time_ms)).where(AuditLog.response_time_ms.isnot(None))
        )
        avg_time = avg_time_result.scalar() or 0
        
        # Total tokens
        tokens_result = await db.execute(
            select(func.sum(AuditLog.tokens_used)).where(AuditLog.tokens_used.isnot(None))
        )
        total_tokens = tokens_result.scalar() or 0
        
        # Errors
        error_result = await db.execute(
            select(func.count(AuditLog.id)).where(AuditLog.success == False)
        )
        errors = error_result.scalar() or 0
        
        return AuditStatsResponse(
            total_requests=total,
            requests_today=today,
            requests_this_week=0,  # Could add weekly count
            requests_by_action={},
            requests_by_role={},
            average_response_time_ms=float(avg_time),
            total_tokens_used=total_tokens,
            error_count=errors,
            error_rate=errors / total if total > 0 else 0,
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

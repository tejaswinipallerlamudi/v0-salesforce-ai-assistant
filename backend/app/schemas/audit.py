"""
Audit log schemas.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AuditLogEntry(BaseModel):
    """A single audit log entry."""
    id: int
    timestamp: datetime
    
    # User info
    user_id: Optional[int] = None
    user_role: str
    
    # Action details
    action: str
    endpoint: str
    
    # Context (masked)
    request_context: Dict[str, Any] = {}
    
    # Sources used
    retrieved_sources: List[Dict[str, Any]] = []
    
    # Response info
    response_summary: str
    success: bool
    error_message: Optional[str] = None
    
    # Performance
    response_time_ms: Optional[int] = None
    tokens_used: Optional[int] = None


class AuditLogResponse(BaseModel):
    """Response for audit log listing."""
    logs: List[AuditLogEntry]
    total: int
    page: int = 1
    page_size: int = 20
    total_pages: int = 1


class AuditStatsResponse(BaseModel):
    """Aggregated audit statistics."""
    total_requests: int
    requests_today: int
    requests_this_week: int
    
    # By action
    requests_by_action: Dict[str, int] = {}
    
    # By role
    requests_by_role: Dict[str, int] = {}
    
    # Performance
    average_response_time_ms: float
    total_tokens_used: int
    
    # Errors
    error_count: int
    error_rate: float

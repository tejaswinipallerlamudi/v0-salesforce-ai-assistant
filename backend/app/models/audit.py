"""
Audit logging model for compliance and debugging.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import String, DateTime, Text, JSON, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AuditAction(str, Enum):
    """Types of auditable actions."""
    EXPLAIN_PAGE = "explain_page"
    ASK_QUESTION = "ask_question"
    GUIDED_STEPS = "guided_steps"
    PROJECT_INSIGHTS = "project_insights"
    SIMILAR_PROJECTS = "similar_projects"
    RISK_ANALYSIS = "risk_analysis"
    KNOWLEDGE_SEARCH = "knowledge_search"
    SALESFORCE_QUERY = "salesforce_query"


class AuditLog(Base):
    """
    Audit log for all AI interactions.
    Stores masked context, no raw sensitive data.
    """
    
    __tablename__ = "audit_logs"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    
    # User info
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), 
        nullable=True
    )
    user_role: Mapped[str] = mapped_column(String(50))
    
    # Action details
    action: Mapped[str] = mapped_column(String(50), index=True)  # AuditAction
    endpoint: Mapped[str] = mapped_column(String(255))
    
    # Request context (masked, no PII)
    request_context: Mapped[dict] = mapped_column(JSON, default=dict)
    # Includes: object_name, record_id (masked), question (if any)
    
    # Retrieved sources used for response
    retrieved_sources: Mapped[list] = mapped_column(JSON, default=list)
    # List of source IDs: [{"type": "sop", "id": 1, "title": "..."}, ...]
    
    # Response summary (not full response, just key info)
    response_summary: Mapped[str] = mapped_column(Text, default="")
    
    # Performance metrics
    response_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    tokens_used: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Status
    success: Mapped[bool] = mapped_column(default=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationship
    user: Mapped[Optional["User"]] = relationship(
        "User", 
        back_populates="audit_logs",
        foreign_keys=[user_id]
    )
    
    def __repr__(self) -> str:
        return f"<AuditLog {self.action} by user:{self.user_id} at {self.created_at}>"


# Import at bottom to avoid circular import
from app.models.user import User

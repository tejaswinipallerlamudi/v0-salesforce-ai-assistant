"""
User and Role models for authentication and authorization.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Role(str, Enum):
    """User roles with different access levels."""
    INTERN = "intern"       # Beginner-friendly explanations, limited scope
    LEAD = "lead"           # Strategic insights, full project intelligence
    ADMIN = "admin"         # Full visibility including debug/audit


class User(Base):
    """User model for authentication and role-based access."""
    
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default=Role.INTERN.value)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Salesforce credentials (optional, per-user)
    salesforce_user_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog", 
        back_populates="user",
        lazy="selectin"
    )
    
    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"


# Import at bottom to avoid circular import
from app.models.audit import AuditLog

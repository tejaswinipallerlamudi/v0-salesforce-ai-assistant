"""
Salesforce metadata and cache models.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import String, DateTime, Text, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SalesforceObjectMetadata(Base):
    """
    Cached Salesforce object metadata.
    Stores field information for objects like Case, Opportunity, etc.
    """
    
    __tablename__ = "salesforce_object_metadata"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    object_name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    label: Mapped[str] = mapped_column(String(255))
    
    # Field metadata stored as JSON for flexibility
    # Format: [{"name": "Priority", "type": "picklist", "label": "Priority", ...}]
    fields_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Allowed fields for this object (subset of all fields that are safe to use)
    allowed_fields: Mapped[list] = mapped_column(JSON, default=list)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    def __repr__(self) -> str:
        return f"<SalesforceObjectMetadata {self.object_name}>"


class SalesforceRecordCache(Base):
    """
    Cached Salesforce record data.
    Only stores allowed/masked field values for performance.
    """
    
    __tablename__ = "salesforce_record_cache"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    object_name: Mapped[str] = mapped_column(String(100), index=True)
    record_id: Mapped[str] = mapped_column(String(50), index=True)
    
    # Masked/filtered record data
    record_data: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Cache management
    cached_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    __table_args__ = (
        Index("ix_sf_record_cache_lookup", "object_name", "record_id"),
    )
    
    def __repr__(self) -> str:
        return f"<SalesforceRecordCache {self.object_name}/{self.record_id}>"

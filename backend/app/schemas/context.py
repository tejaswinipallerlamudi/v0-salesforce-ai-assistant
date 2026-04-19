"""
Context-related schemas for AI interactions.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class PageContext(BaseModel):
    """
    Context about the current Salesforce page/record.
    All data is pre-masked and filtered.
    """
    object_name: str
    object_label: str
    record_id: Optional[str] = None  # Masked ID
    
    # Safe field metadata
    fields: List[Dict[str, Any]] = []  # [{name, label, type, value}]
    
    # Record status info
    status: Optional[str] = None
    priority: Optional[str] = None
    record_type: Optional[str] = None
    
    # Timestamps (safe)
    created_date: Optional[datetime] = None
    last_modified_date: Optional[datetime] = None


class RetrievedSource(BaseModel):
    """A knowledge source retrieved for context."""
    source_type: str  # "sop", "kt_note", "project", "template"
    source_id: int
    title: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    snippet: Optional[str] = None  # Relevant excerpt


class ContextRequest(BaseModel):
    """Request to build context for AI."""
    object_name: str
    record_id: Optional[str] = None
    user_role: str = "intern"
    include_knowledge: bool = True
    knowledge_limit: int = Field(default=5, ge=1, le=10)


class ContextResponse(BaseModel):
    """Built context ready for AI consumption."""
    page_context: PageContext
    retrieved_sources: List[RetrievedSource] = []
    role_context: str  # Role-specific instructions
    
    # Debug info (only for admin role)
    masked_field_count: int = 0
    pii_masked_count: int = 0
    total_sources_searched: int = 0

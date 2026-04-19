"""
Salesforce-related schemas.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class SalesforceField(BaseModel):
    """Salesforce field metadata."""
    name: str
    label: str
    type: str  # e.g., "string", "picklist", "boolean", "date"
    is_required: bool = False
    is_updateable: bool = True
    picklist_values: Optional[List[str]] = None
    help_text: Optional[str] = None


class SalesforceObject(BaseModel):
    """Salesforce object metadata."""
    name: str
    label: str
    label_plural: str
    description: Optional[str] = None
    fields: List[SalesforceField] = []
    allowed_field_count: int = 0  # Number of fields safe to use


class SalesforceRecord(BaseModel):
    """A single Salesforce record (masked/filtered)."""
    id: str
    object_name: str
    fields: Dict[str, Any]  # Only allowed fields, PII masked
    record_type: Optional[str] = None
    created_date: Optional[datetime] = None
    last_modified_date: Optional[datetime] = None


class SalesforceObjectListResponse(BaseModel):
    """Response for listing Salesforce objects."""
    objects: List[SalesforceObject]
    total: int


class SalesforceRecordListResponse(BaseModel):
    """Response for listing records of an object."""
    object_name: str
    records: List[SalesforceRecord]
    total: int
    page: int = 1
    page_size: int = 20


class SalesforceRecordResponse(BaseModel):
    """Response for a single record."""
    record: SalesforceRecord
    metadata: Optional[SalesforceObject] = None  # Optional object metadata
    safety_info: SafetyInfo = Field(default_factory=lambda: SafetyInfo())


class SafetyInfo(BaseModel):
    """Information about data safety measures applied."""
    fields_filtered: int = 0  # Number of fields removed
    pii_masked: int = 0  # Number of PII instances masked
    allowed_fields_only: bool = True
    masking_applied: bool = True

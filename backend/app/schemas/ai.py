"""
AI-related schemas for requests and responses.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.schemas.context import RetrievedSource


class ExplainPageRequest(BaseModel):
    """Request to explain a Salesforce page."""
    object_name: str
    record_id: Optional[str] = None
    user_role: str = "intern"
    detail_level: str = Field(default="standard", pattern="^(brief|standard|detailed)$")


class FieldExplanation(BaseModel):
    """Explanation of a single field."""
    field_name: str
    field_label: str
    field_type: str
    current_value: Optional[str] = None
    explanation: str
    tips: Optional[str] = None


class ExplainPageResponse(BaseModel):
    """Response with page explanation."""
    object_name: str
    object_label: str
    record_id: Optional[str] = None
    
    # Overall page explanation
    summary: str
    purpose: str  # What this page/record is for
    
    # Field-by-field explanations
    field_explanations: List[FieldExplanation] = []
    
    # Related SOPs/processes
    related_processes: List[str] = []
    
    # Sources used
    sources_used: List[RetrievedSource] = []
    
    # Safety indicator
    safety_note: str = "This explanation uses only approved metadata fields."


class QuestionRequest(BaseModel):
    """Request to ask a question about the current context."""
    question: str = Field(min_length=3, max_length=1000)
    object_name: Optional[str] = None
    record_id: Optional[str] = None
    user_role: str = "intern"


class QuestionResponse(BaseModel):
    """Response to a user question."""
    question: str
    answer: str
    confidence: float = Field(ge=0.0, le=1.0)
    
    # Sources that informed the answer
    sources_used: List[RetrievedSource] = []
    
    # Related actions the user might want to take
    suggested_actions: List[str] = []
    
    # If we couldn't fully answer
    limitations: Optional[str] = None
    
    # Safety
    safety_note: str = "Answer based on approved SOPs and metadata only."


class GuidedStep(BaseModel):
    """A single step in a guided process."""
    step_number: int
    title: str
    description: str
    is_optional: bool = False
    tips: Optional[str] = None
    related_field: Optional[str] = None  # SF field this step relates to


class GuidedStepsRequest(BaseModel):
    """Request for guided workflow steps."""
    workflow_type: str  # e.g., "escalation", "case_closure", "approval"
    object_name: Optional[str] = None
    record_id: Optional[str] = None
    user_role: str = "intern"


class GuidedStepsResponse(BaseModel):
    """Response with guided workflow steps."""
    workflow_type: str
    workflow_title: str
    description: str
    
    steps: List[GuidedStep]
    
    # Prerequisites or warnings
    prerequisites: List[str] = []
    warnings: List[str] = []
    
    # Source SOP
    source_sop: Optional[RetrievedSource] = None
    
    # Estimated time
    estimated_time_minutes: Optional[int] = None

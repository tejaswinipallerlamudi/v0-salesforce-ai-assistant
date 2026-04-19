"""
Project Intelligence schemas for insights, risks, and recommendations.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class SimilarProject(BaseModel):
    """A similar historical project."""
    project_id: int
    project_name: str
    similarity_score: float = Field(ge=0.0, le=1.0)
    
    # Key matching factors
    matching_factors: List[str] = []  # e.g., ["industry", "project_type", "issue_pattern"]
    
    # Outcome summary
    outcome: str  # "completed", "escalated", "cancelled"
    duration_days: Optional[int] = None
    
    # Key learnings
    lessons_summary: Optional[str] = None
    solutions_applied: List[str] = []


class RiskIndicator(BaseModel):
    """A detected risk in the current project/record."""
    risk_id: str
    risk_type: str  # e.g., "sla_breach", "no_progress", "reassignment", "blocker"
    severity: str = Field(pattern="^(low|medium|high|critical)$")
    
    title: str
    description: str
    
    # What triggered this risk
    trigger: str
    
    # Recommended actions
    recommended_actions: List[str] = []
    
    # Related SOP if any
    related_sop: Optional[str] = None


class Recommendation(BaseModel):
    """A recommended resource or action."""
    recommendation_type: str  # "sop", "template", "action", "escalation"
    title: str
    description: str
    relevance_score: float = Field(ge=0.0, le=1.0)
    
    # Resource reference if applicable
    resource_id: Optional[int] = None
    resource_type: Optional[str] = None


class ProjectSummary(BaseModel):
    """AI-generated project summary."""
    summary: str
    key_points: List[str] = []
    current_status: str
    next_steps: List[str] = []
    blockers: List[str] = []


class InsightsRequest(BaseModel):
    """Request for project intelligence insights."""
    object_name: str
    record_id: Optional[str] = None
    user_role: str = "lead"
    
    # What insights to include
    include_similar_projects: bool = True
    include_risks: bool = True
    include_recommendations: bool = True
    include_summary: bool = True
    
    # Limits
    similar_projects_limit: int = Field(default=5, ge=1, le=10)
    recommendations_limit: int = Field(default=5, ge=1, le=10)


class InsightsResponse(BaseModel):
    """Full project intelligence response."""
    object_name: str
    record_id: Optional[str] = None
    
    # Similar projects from history
    similar_projects: List[SimilarProject] = []
    
    # Detected risks
    risks: List[RiskIndicator] = []
    risk_summary: Optional[str] = None
    
    # Recommendations
    recommendations: List[Recommendation] = []
    
    # Auto-generated summary
    summary: Optional[ProjectSummary] = None
    
    # Metadata
    analysis_timestamp: datetime = Field(default_factory=datetime.utcnow)
    confidence_score: float = Field(default=0.8, ge=0.0, le=1.0)

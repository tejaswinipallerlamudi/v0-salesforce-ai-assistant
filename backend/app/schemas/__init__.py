"""
Pydantic schemas for API request/response validation.
"""

from app.schemas.common import HealthResponse, ErrorResponse
from app.schemas.salesforce import (
    SalesforceObject,
    SalesforceField,
    SalesforceRecord,
    SalesforceObjectListResponse,
    SalesforceRecordListResponse,
    SalesforceRecordResponse,
)
from app.schemas.context import (
    PageContext,
    ContextRequest,
    ContextResponse,
)
from app.schemas.ai import (
    ExplainPageRequest,
    ExplainPageResponse,
    QuestionRequest,
    QuestionResponse,
    GuidedStepsRequest,
    GuidedStepsResponse,
    GuidedStep,
)
from app.schemas.insights import (
    InsightsRequest,
    InsightsResponse,
    SimilarProject,
    RiskIndicator,
    Recommendation,
)
from app.schemas.audit import (
    AuditLogEntry,
    AuditLogResponse,
)

__all__ = [
    # Common
    "HealthResponse",
    "ErrorResponse",
    # Salesforce
    "SalesforceObject",
    "SalesforceField",
    "SalesforceRecord",
    "SalesforceObjectListResponse",
    "SalesforceRecordListResponse",
    "SalesforceRecordResponse",
    # Context
    "PageContext",
    "ContextRequest",
    "ContextResponse",
    # AI
    "ExplainPageRequest",
    "ExplainPageResponse",
    "QuestionRequest",
    "QuestionResponse",
    "GuidedStepsRequest",
    "GuidedStepsResponse",
    "GuidedStep",
    # Insights
    "InsightsRequest",
    "InsightsResponse",
    "SimilarProject",
    "RiskIndicator",
    "Recommendation",
    # Audit
    "AuditLogEntry",
    "AuditLogResponse",
]

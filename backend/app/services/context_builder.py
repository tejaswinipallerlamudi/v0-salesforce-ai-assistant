"""
Context builder service.
Combines Salesforce data, knowledge, and role context for AI consumption.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.user import Role
from app.security.masking import PIIMasker, mask_record
from app.security.field_allowlist import FieldAllowlist
from app.security.guardrails import RoleGuardrails, get_role_from_string
from app.services.salesforce_service import get_salesforce_service
from app.services.retrieval_service import get_retrieval_service
from app.schemas.context import PageContext, ContextRequest, ContextResponse, RetrievedSource

settings = get_settings()


class ContextBuilder:
    """
    Builds safe, role-appropriate context for AI prompts.
    Combines Salesforce data with retrieved knowledge.
    """
    
    # Role-specific context instructions
    ROLE_INSTRUCTIONS = {
        Role.INTERN: """You are helping a new team member (intern level) understand Salesforce.
- Use simple, clear language
- Explain technical terms
- Provide step-by-step guidance
- Focus on learning and understanding
- Be encouraging and supportive""",
        
        Role.LEAD: """You are assisting an experienced team lead.
- Provide strategic insights
- Focus on patterns and trends
- Highlight risks and opportunities
- Suggest process improvements
- Be concise but thorough""",
        
        Role.ADMIN: """You are assisting a system administrator.
- Provide full technical details
- Include configuration considerations
- Highlight security implications
- Suggest automation opportunities
- Be precise and comprehensive""",
    }
    
    def __init__(self):
        self._masker = PIIMasker(enabled=settings.enable_pii_masking)
        self._allowlist = FieldAllowlist()
        self._sf_service = get_salesforce_service()
        self._retrieval_service = get_retrieval_service()
    
    async def build_context(
        self,
        db: AsyncSession,
        request: ContextRequest,
    ) -> ContextResponse:
        """
        Build full context for AI consumption.
        
        Args:
            db: Database session
            request: Context request with object/record info
            
        Returns:
            Safe, masked context ready for AI
        """
        role = get_role_from_string(request.user_role)
        guardrails = RoleGuardrails(role)
        
        # Check access
        if not guardrails.can_access_object(request.object_name):
            raise ValueError(f"Access denied to object: {request.object_name}")
        
        # Build page context from Salesforce
        page_context = await self._build_page_context(
            object_name=request.object_name,
            record_id=request.record_id,
        )
        
        # Retrieve relevant knowledge
        retrieved_sources = []
        total_searched = 0
        
        if request.include_knowledge:
            # Get SOPs for this object
            sops = await self._retrieval_service.get_sops_for_object(
                db=db,
                object_name=request.object_name,
                limit=request.knowledge_limit // 2,
            )
            retrieved_sources.extend(sops)
            
            # Get field guides
            field_guides = await self._retrieval_service.get_field_guides(
                db=db,
                object_name=request.object_name,
            )
            retrieved_sources.extend(field_guides[:request.knowledge_limit // 2])
            
            total_searched = len(sops) + len(field_guides)
            
            # If we have a record, do semantic search based on context
            if request.record_id and page_context.status:
                context_query = f"{request.object_name} {page_context.status} {page_context.priority or ''}"
                similar = await self._retrieval_service.search_similar(
                    db=db,
                    query=context_query,
                    limit=request.knowledge_limit - len(retrieved_sources),
                )
                retrieved_sources.extend(similar)
                total_searched += len(similar)
        
        # Get role-specific instructions
        role_context = self.ROLE_INSTRUCTIONS.get(role, self.ROLE_INSTRUCTIONS[Role.INTERN])
        
        return ContextResponse(
            page_context=page_context,
            retrieved_sources=retrieved_sources[:request.knowledge_limit],
            role_context=role_context,
            masked_field_count=0,  # Will be set if admin
            pii_masked_count=0,
            total_sources_searched=total_searched,
        )
    
    async def _build_page_context(
        self,
        object_name: str,
        record_id: Optional[str] = None,
    ) -> PageContext:
        """Build masked page context from Salesforce data."""
        try:
            # Get object metadata
            metadata = await self._sf_service.get_object_metadata(object_name)
            
            if record_id:
                # Get specific record
                record, safety_info = await self._sf_service.get_record(
                    object_name=object_name,
                    record_id=record_id,
                )
                
                # Build field list for context
                fields = []
                for field in metadata.fields:
                    value = record.fields.get(field.name)
                    fields.append({
                        "name": field.name,
                        "label": field.label,
                        "type": field.type,
                        "value": value,
                    })
                
                return PageContext(
                    object_name=object_name,
                    object_label=metadata.label,
                    record_id=record.id,
                    fields=fields,
                    status=record.fields.get("Status"),
                    priority=record.fields.get("Priority"),
                    record_type=record.record_type,
                    created_date=record.created_date,
                    last_modified_date=record.last_modified_date,
                )
            else:
                # Just object metadata, no record
                fields = [
                    {
                        "name": field.name,
                        "label": field.label,
                        "type": field.type,
                        "value": None,
                    }
                    for field in metadata.fields
                ]
                
                return PageContext(
                    object_name=object_name,
                    object_label=metadata.label,
                    fields=fields,
                )
                
        except Exception as e:
            # Return minimal context on error
            return PageContext(
                object_name=object_name,
                object_label=object_name,
            )
    
    def build_prompt_context(
        self,
        page_context: PageContext,
        retrieved_sources: List[RetrievedSource],
        role: Role,
    ) -> str:
        """
        Build formatted context string for AI prompt.
        """
        parts = []
        
        # Role context
        parts.append(f"## Role Context\n{self.ROLE_INSTRUCTIONS.get(role, '')}")
        
        # Page context
        parts.append(f"\n## Current Page: {page_context.object_label}")
        if page_context.record_id:
            parts.append(f"Record ID: {page_context.record_id}")
        if page_context.status:
            parts.append(f"Status: {page_context.status}")
        if page_context.priority:
            parts.append(f"Priority: {page_context.priority}")
        
        # Fields
        if page_context.fields:
            parts.append("\n### Fields:")
            for field in page_context.fields:
                value = field.get("value", "Not set")
                parts.append(f"- {field['label']} ({field['name']}): {value}")
        
        # Retrieved knowledge
        if retrieved_sources:
            parts.append("\n## Relevant Knowledge:")
            for source in retrieved_sources:
                parts.append(f"\n### {source.title} ({source.source_type})")
                if source.snippet:
                    parts.append(source.snippet)
        
        return "\n".join(parts)


# Singleton
_context_builder: Optional[ContextBuilder] = None


def get_context_builder() -> ContextBuilder:
    """Get or create context builder instance."""
    global _context_builder
    if _context_builder is None:
        _context_builder = ContextBuilder()
    return _context_builder

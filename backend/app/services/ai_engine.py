"""
AI Engine service.
Handles all AI/LLM interactions with OpenAI.
"""

from typing import List, Optional, Tuple
import asyncio
import json

from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import get_settings
from app.models.user import Role
from app.security.guardrails import get_role_from_string
from app.prompts.templates import (
    get_system_prompt,
    format_explain_page_prompt,
    format_qa_prompt,
    format_guided_steps_prompt,
    format_insights_prompt,
    format_summary_prompt,
)
from app.schemas.ai import (
    FieldExplanation,
    ExplainPageResponse,
    QuestionResponse,
    GuidedStep,
    GuidedStepsResponse,
)
from app.schemas.insights import (
    SimilarProject,
    RiskIndicator,
    Recommendation,
    ProjectSummary,
    InsightsResponse,
)
from app.schemas.context import PageContext, RetrievedSource

settings = get_settings()


class AIEngine:
    """
    AI Engine for generating responses using OpenAI.
    Includes retry logic and fallback handling.
    """
    
    def __init__(self):
        self._client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
        self._model = settings.openai_model
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def _call_openai(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> Tuple[str, int]:
        """
        Make OpenAI API call with retry logic.
        Returns response text and token count.
        """
        if not self._client:
            return "AI service not configured. Please set OPENAI_API_KEY.", 0
        
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
            )
        )
        
        text = response.choices[0].message.content
        tokens = response.usage.total_tokens if response.usage else 0
        return text, tokens
    
    async def explain_page(
        self,
        page_context: PageContext,
        retrieved_sources: List[RetrievedSource],
        role: str = "intern",
    ) -> Tuple[ExplainPageResponse, int]:
        """
        Generate page explanation.
        Returns response and token count.
        """
        role_enum = get_role_from_string(role)
        
        # Build context string
        context = self._build_context_string(page_context, retrieved_sources)
        
        # Get prompts
        system_prompt = get_system_prompt(role_enum)
        user_prompt = format_explain_page_prompt(context, page_context.object_label)
        
        # Call AI
        response_text, tokens = await self._call_openai(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
        
        # Parse response into structured format
        field_explanations = []
        for field in page_context.fields[:10]:  # Limit to 10 fields
            field_explanations.append(FieldExplanation(
                field_name=field["name"],
                field_label=field["label"],
                field_type=field["type"],
                current_value=str(field.get("value")) if field.get("value") else None,
                explanation=f"See explanation above for details about {field['label']}.",
            ))
        
        return ExplainPageResponse(
            object_name=page_context.object_name,
            object_label=page_context.object_label,
            record_id=page_context.record_id,
            summary=response_text,
            purpose=f"This {page_context.object_label} page is used to manage and track {page_context.object_label.lower()} records in Salesforce.",
            field_explanations=field_explanations,
            related_processes=[s.title for s in retrieved_sources if s.source_type == "sop"][:3],
            sources_used=retrieved_sources[:5],
            safety_note="This explanation uses only approved metadata fields.",
        ), tokens
    
    async def answer_question(
        self,
        question: str,
        page_context: Optional[PageContext],
        retrieved_sources: List[RetrievedSource],
        role: str = "intern",
    ) -> Tuple[QuestionResponse, int]:
        """
        Answer a user question based on context.
        """
        role_enum = get_role_from_string(role)
        
        # Build context
        context = self._build_context_string(page_context, retrieved_sources) if page_context else ""
        if retrieved_sources:
            context += "\n\n## Knowledge Base:\n"
            for source in retrieved_sources:
                context += f"\n### {source.title}\n{source.snippet or ''}"
        
        # Get prompts
        system_prompt = get_system_prompt(role_enum)
        user_prompt = format_qa_prompt(context, question)
        
        # Call AI
        response_text, tokens = await self._call_openai(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
        
        return QuestionResponse(
            question=question,
            answer=response_text,
            confidence=0.85 if retrieved_sources else 0.6,
            sources_used=retrieved_sources[:5],
            suggested_actions=[],
            safety_note="Answer based on approved SOPs and metadata only.",
        ), tokens
    
    async def generate_guided_steps(
        self,
        workflow_type: str,
        page_context: Optional[PageContext],
        retrieved_sources: List[RetrievedSource],
        role: str = "intern",
    ) -> Tuple[GuidedStepsResponse, int]:
        """
        Generate guided workflow steps.
        """
        role_enum = get_role_from_string(role)
        
        # Build context
        context = self._build_context_string(page_context, retrieved_sources) if page_context else ""
        if retrieved_sources:
            context += "\n\n## Relevant Procedures:\n"
            for source in retrieved_sources:
                context += f"\n### {source.title}\n{source.snippet or ''}"
        
        # Get prompts
        system_prompt = get_system_prompt(role_enum)
        user_prompt = format_guided_steps_prompt(context, workflow_type)
        
        # Call AI
        response_text, tokens = await self._call_openai(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
        
        # Parse into steps (simple extraction)
        steps = self._extract_steps(response_text)
        
        source_sop = next((s for s in retrieved_sources if s.source_type == "sop"), None)
        
        return GuidedStepsResponse(
            workflow_type=workflow_type,
            workflow_title=f"{workflow_type.replace('_', ' ').title()} Process",
            description=f"Step-by-step guide for {workflow_type}",
            steps=steps,
            prerequisites=[],
            warnings=[],
            source_sop=source_sop,
            estimated_time_minutes=len(steps) * 5,  # Rough estimate
        ), tokens
    
    async def generate_insights(
        self,
        page_context: PageContext,
        retrieved_sources: List[RetrievedSource],
        similar_projects: List[Tuple],  # (ProjectHistory, score)
        role: str = "lead",
    ) -> Tuple[InsightsResponse, int]:
        """
        Generate project intelligence insights.
        """
        role_enum = get_role_from_string(role)
        
        # Build rich context
        context = self._build_context_string(page_context, retrieved_sources)
        
        # Add similar projects
        if similar_projects:
            context += "\n\n## Similar Historical Projects:\n"
            for project, score in similar_projects[:3]:
                context += f"\n### {project.project_name} (similarity: {score:.2f})\n"
                context += f"Industry: {project.client_industry}, Outcome: {project.outcome}\n"
                context += f"Lessons: {project.lessons_learned[:300]}...\n"
        
        # Get prompts
        system_prompt = get_system_prompt(role_enum)
        user_prompt = format_insights_prompt(context)
        
        # Call AI
        response_text, tokens = await self._call_openai(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=3000,
        )
        
        # Build similar projects list
        similar_project_responses = [
            SimilarProject(
                project_id=project.id,
                project_name=project.project_name,
                similarity_score=score,
                matching_factors=[project.client_industry, project.project_type],
                outcome=project.outcome,
                duration_days=project.duration_days,
                lessons_summary=project.lessons_learned[:200] if project.lessons_learned else None,
                solutions_applied=project.solutions_applied[:3] if project.solutions_applied else [],
            )
            for project, score in similar_projects[:5]
        ]
        
        # Detect risks based on context
        risks = self._detect_risks(page_context)
        
        # Build recommendations
        recommendations = [
            Recommendation(
                recommendation_type="sop",
                title=source.title,
                description=f"Relevant procedure: {source.snippet[:100]}..." if source.snippet else "Relevant procedure",
                relevance_score=source.relevance_score,
                resource_id=source.source_id,
                resource_type=source.source_type,
            )
            for source in retrieved_sources[:5]
        ]
        
        return InsightsResponse(
            object_name=page_context.object_name,
            record_id=page_context.record_id,
            similar_projects=similar_project_responses,
            risks=risks,
            risk_summary=f"Found {len(risks)} potential risk indicators." if risks else "No significant risks detected.",
            recommendations=recommendations,
            summary=ProjectSummary(
                summary=response_text[:500],
                key_points=[],
                current_status=page_context.status or "Unknown",
                next_steps=[],
                blockers=[],
            ),
            confidence_score=0.8,
        ), tokens
    
    def _build_context_string(
        self,
        page_context: PageContext,
        retrieved_sources: List[RetrievedSource],
    ) -> str:
        """Build formatted context string."""
        parts = []
        
        parts.append(f"## Current Page: {page_context.object_label}")
        if page_context.record_id:
            parts.append(f"Record ID: {page_context.record_id}")
        if page_context.status:
            parts.append(f"Status: {page_context.status}")
        if page_context.priority:
            parts.append(f"Priority: {page_context.priority}")
        
        if page_context.fields:
            parts.append("\n### Fields:")
            for field in page_context.fields[:15]:
                value = field.get("value", "Not set")
                parts.append(f"- {field['label']}: {value}")
        
        if retrieved_sources:
            parts.append("\n## Retrieved Knowledge:")
            for source in retrieved_sources[:5]:
                parts.append(f"\n### {source.title}")
                if source.snippet:
                    parts.append(source.snippet)
        
        return "\n".join(parts)
    
    def _extract_steps(self, text: str) -> List[GuidedStep]:
        """Extract numbered steps from AI response."""
        steps = []
        lines = text.split("\n")
        step_num = 0
        
        for line in lines:
            line = line.strip()
            # Look for numbered items
            if line and (line[0].isdigit() or line.startswith("-") or line.startswith("*")):
                step_num += 1
                # Clean up the line
                clean = line.lstrip("0123456789.-*) ").strip()
                if clean:
                    steps.append(GuidedStep(
                        step_number=step_num,
                        title=clean[:100],
                        description=clean,
                        is_optional=False,
                    ))
        
        # If no steps found, create one from the whole text
        if not steps:
            steps.append(GuidedStep(
                step_number=1,
                title="Follow the procedure",
                description=text[:500],
                is_optional=False,
            ))
        
        return steps[:10]  # Limit to 10 steps
    
    def _detect_risks(self, page_context: PageContext) -> List[RiskIndicator]:
        """Detect risks based on page context."""
        risks = []
        
        # High priority check
        if page_context.priority and page_context.priority.lower() in ["critical", "high"]:
            if page_context.status and page_context.status.lower() not in ["closed", "resolved"]:
                risks.append(RiskIndicator(
                    risk_id="high_priority_open",
                    risk_type="priority",
                    severity="high",
                    title="High Priority Item Still Open",
                    description=f"This {page_context.object_label} has {page_context.priority} priority and is still in {page_context.status} status.",
                    trigger=f"Priority: {page_context.priority}, Status: {page_context.status}",
                    recommended_actions=[
                        "Review current progress",
                        "Check SLA compliance",
                        "Consider escalation if needed",
                    ],
                ))
        
        # Escalated status
        if page_context.status and "escalat" in page_context.status.lower():
            risks.append(RiskIndicator(
                risk_id="escalated",
                risk_type="escalation",
                severity="medium",
                title="Item Has Been Escalated",
                description="This item has been escalated and requires attention.",
                trigger=f"Status: {page_context.status}",
                recommended_actions=[
                    "Review escalation notes",
                    "Engage specialized team",
                    "Update customer on escalation",
                ],
            ))
        
        return risks


# Singleton
_ai_engine: Optional[AIEngine] = None


def get_ai_engine() -> AIEngine:
    """Get or create AI engine instance."""
    global _ai_engine
    if _ai_engine is None:
        _ai_engine = AIEngine()
    return _ai_engine

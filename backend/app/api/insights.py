"""
Project Intelligence API routes.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.context_builder import get_context_builder, ContextBuilder
from app.services.retrieval_service import get_retrieval_service, RetrievalService
from app.services.ai_engine import get_ai_engine, AIEngine
from app.schemas.context import ContextRequest
from app.schemas.insights import InsightsRequest, InsightsResponse

router = APIRouter()


@router.post("/analyze", response_model=InsightsResponse)
async def analyze_project(
    request: InsightsRequest,
    db: AsyncSession = Depends(get_db),
    context_builder: ContextBuilder = Depends(get_context_builder),
    retrieval_service: RetrievalService = Depends(get_retrieval_service),
    ai_engine: AIEngine = Depends(get_ai_engine),
):
    """
    Full project intelligence analysis.
    Returns similar projects, risks, recommendations, and summary.
    """
    try:
        # Build context
        context_request = ContextRequest(
            object_name=request.object_name,
            record_id=request.record_id,
            user_role=request.user_role,
            include_knowledge=True,
        )
        context = await context_builder.build_context(db=db, request=context_request)
        
        # Find similar projects
        similar_projects = []
        if request.include_similar_projects:
            description = f"{context.page_context.object_name} {context.page_context.status or ''} {context.page_context.priority or ''}"
            similar_projects = await retrieval_service.find_similar_projects(
                db=db,
                description=description,
                limit=request.similar_projects_limit,
            )
        
        # Generate full insights
        response, tokens = await ai_engine.generate_insights(
            page_context=context.page_context,
            retrieved_sources=context.retrieved_sources,
            similar_projects=similar_projects,
            role=request.user_role,
        )
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

"""
AI API routes for Salesforce Buddy features.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.context_builder import get_context_builder, ContextBuilder
from app.services.retrieval_service import get_retrieval_service, RetrievalService
from app.services.ai_engine import get_ai_engine, AIEngine
from app.schemas.context import ContextRequest
from app.schemas.ai import (
    ExplainPageRequest,
    ExplainPageResponse,
    QuestionRequest,
    QuestionResponse,
    GuidedStepsRequest,
    GuidedStepsResponse,
)

router = APIRouter()


@router.post("/explain", response_model=ExplainPageResponse)
async def explain_page(
    request: ExplainPageRequest,
    db: AsyncSession = Depends(get_db),
    context_builder: ContextBuilder = Depends(get_context_builder),
    ai_engine: AIEngine = Depends(get_ai_engine),
):
    """
    Explain a Salesforce page.
    Provides field-by-field explanations and related processes.
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
        
        # Generate explanation
        response, tokens = await ai_engine.explain_page(
            page_context=context.page_context,
            retrieved_sources=context.retrieved_sources,
            role=request.user_role,
        )
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/question", response_model=QuestionResponse)
async def ask_question(
    request: QuestionRequest,
    db: AsyncSession = Depends(get_db),
    context_builder: ContextBuilder = Depends(get_context_builder),
    retrieval_service: RetrievalService = Depends(get_retrieval_service),
    ai_engine: AIEngine = Depends(get_ai_engine),
):
    """
    Answer a user question based on context and knowledge base.
    """
    try:
        # Build context if object provided
        page_context = None
        if request.object_name:
            context_request = ContextRequest(
                object_name=request.object_name,
                record_id=request.record_id,
                user_role=request.user_role,
                include_knowledge=False,  # We'll do our own search
            )
            context = await context_builder.build_context(db=db, request=context_request)
            page_context = context.page_context
        
        # Search knowledge base for relevant content
        retrieved_sources = await retrieval_service.search_similar(
            db=db,
            query=request.question,
            limit=5,
        )
        
        # Generate answer
        response, tokens = await ai_engine.answer_question(
            question=request.question,
            page_context=page_context,
            retrieved_sources=retrieved_sources,
            role=request.user_role,
        )
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/guided-steps", response_model=GuidedStepsResponse)
async def get_guided_steps(
    request: GuidedStepsRequest,
    db: AsyncSession = Depends(get_db),
    context_builder: ContextBuilder = Depends(get_context_builder),
    retrieval_service: RetrievalService = Depends(get_retrieval_service),
    ai_engine: AIEngine = Depends(get_ai_engine),
):
    """
    Get step-by-step guidance for a workflow.
    """
    try:
        # Build context if object provided
        page_context = None
        if request.object_name:
            context_request = ContextRequest(
                object_name=request.object_name,
                record_id=request.record_id,
                user_role=request.user_role,
                include_knowledge=False,
            )
            context = await context_builder.build_context(db=db, request=context_request)
            page_context = context.page_context
        
        # Search for relevant SOPs
        retrieved_sources = await retrieval_service.search_similar(
            db=db,
            query=f"{request.workflow_type} procedure steps",
            limit=3,
            source_types=["sop"],
        )
        
        # Generate guided steps
        response, tokens = await ai_engine.generate_guided_steps(
            workflow_type=request.workflow_type,
            page_context=page_context,
            retrieved_sources=retrieved_sources,
            role=request.user_role,
        )
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

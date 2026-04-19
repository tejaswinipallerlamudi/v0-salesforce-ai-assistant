"""
Context API routes.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.context_builder import get_context_builder, ContextBuilder
from app.schemas.context import ContextRequest, ContextResponse

router = APIRouter()


@router.post("/build", response_model=ContextResponse)
async def build_context(
    request: ContextRequest,
    db: AsyncSession = Depends(get_db),
    context_builder: ContextBuilder = Depends(get_context_builder),
):
    """
    Build context for AI consumption.
    Combines Salesforce data with retrieved knowledge.
    """
    try:
        response = await context_builder.build_context(
            db=db,
            request=request,
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

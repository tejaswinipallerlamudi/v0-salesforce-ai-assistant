"""
Salesforce API routes.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.services.salesforce_service import SalesforceService, get_salesforce_service
from app.schemas.salesforce import (
    SalesforceObjectListResponse,
    SalesforceRecordListResponse,
    SalesforceRecordResponse,
)

router = APIRouter()


@router.get("/objects", response_model=SalesforceObjectListResponse)
async def list_objects(
    sf_service: SalesforceService = Depends(get_salesforce_service),
):
    """
    List available Salesforce objects.
    Returns only supported objects with allowed field counts.
    """
    try:
        objects = await sf_service.get_objects()
        return SalesforceObjectListResponse(
            objects=objects,
            total=len(objects),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/objects/{object_name}")
async def get_object_metadata(
    object_name: str,
    sf_service: SalesforceService = Depends(get_salesforce_service),
):
    """
    Get detailed metadata for a Salesforce object.
    Returns only allowed fields.
    """
    try:
        obj = await sf_service.get_object_metadata(object_name)
        return obj
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/records/{object_name}", response_model=SalesforceRecordListResponse)
async def list_records(
    object_name: str,
    status: Optional[str] = Query(None, description="Filter by Status field"),
    priority: Optional[str] = Query(None, description="Filter by Priority field"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sf_service: SalesforceService = Depends(get_salesforce_service),
):
    """
    List records from a Salesforce object.
    Returns masked/filtered records only.
    """
    try:
        # Build filters from query params
        filters = {}
        if status:
            filters["Status"] = status
        if priority:
            filters["Priority"] = priority
        
        offset = (page - 1) * page_size
        records, total = await sf_service.get_records(
            object_name=object_name,
            filters=filters if filters else None,
            limit=page_size,
            offset=offset,
        )
        
        return SalesforceRecordListResponse(
            object_name=object_name,
            records=records,
            total=total,
            page=page,
            page_size=page_size,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/record/{object_name}/{record_id}", response_model=SalesforceRecordResponse)
async def get_record(
    object_name: str,
    record_id: str,
    include_metadata: bool = Query(False, description="Include object metadata"),
    sf_service: SalesforceService = Depends(get_salesforce_service),
):
    """
    Get a single Salesforce record by ID.
    Returns masked record with safety info.
    """
    try:
        record, safety_info = await sf_service.get_record(
            object_name=object_name,
            record_id=record_id,
        )
        
        metadata = None
        if include_metadata:
            metadata = await sf_service.get_object_metadata(object_name)
        
        return SalesforceRecordResponse(
            record=record,
            metadata=metadata,
            safety_info=safety_info,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

"""
Salesforce API integration service.
Handles authentication, metadata retrieval, and record queries.
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
import asyncio
from functools import lru_cache

from simple_salesforce import Salesforce, SalesforceLogin
from simple_salesforce.exceptions import SalesforceError

from app.core.config import get_settings
from app.security.field_allowlist import FieldAllowlist
from app.security.masking import PIIMasker
from app.schemas.salesforce import (
    SalesforceObject,
    SalesforceField,
    SalesforceRecord,
    SafetyInfo,
)

settings = get_settings()


class SalesforceService:
    """
    Service for interacting with Salesforce API.
    Implements field allowlisting and PII masking.
    """
    
    def __init__(self):
        self._sf: Optional[Salesforce] = None
        self._session_expiry: Optional[datetime] = None
        self._allowlist = FieldAllowlist()
        self._masker = PIIMasker(enabled=settings.enable_pii_masking)
        self._metadata_cache: Dict[str, SalesforceObject] = {}
        
    async def _get_connection(self) -> Salesforce:
        """
        Get or create Salesforce connection with session management.
        """
        # Check if we need to reconnect
        if self._sf is None or (
            self._session_expiry and datetime.utcnow() > self._session_expiry
        ):
            await self._connect()
        return self._sf
    
    async def _connect(self) -> None:
        """
        Establish connection to Salesforce using OAuth.
        """
        if not settings.salesforce_username:
            raise ValueError("Salesforce credentials not configured")
        
        # Run synchronous Salesforce login in thread pool
        loop = asyncio.get_event_loop()
        self._sf = await loop.run_in_executor(
            None,
            lambda: Salesforce(
                username=settings.salesforce_username,
                password=settings.salesforce_password,
                security_token=settings.salesforce_security_token,
                domain=settings.salesforce_domain.replace("https://", "").replace("login.", "").replace(".salesforce.com", ""),
            )
        )
        # Session valid for 2 hours (Salesforce default)
        self._session_expiry = datetime.utcnow() + timedelta(hours=2)
    
    async def get_objects(self) -> List[SalesforceObject]:
        """
        Get list of available Salesforce objects.
        Returns only objects we support (Case, Opportunity, Account, etc.)
        """
        # Return supported objects (subset for security)
        supported_objects = [
            SalesforceObject(
                name="Case",
                label="Case",
                label_plural="Cases",
                description="Customer support cases and issues",
                allowed_field_count=len(self._allowlist.get_allowed_fields("Case")),
            ),
            SalesforceObject(
                name="Opportunity",
                label="Opportunity",
                label_plural="Opportunities",
                description="Sales opportunities and deals",
                allowed_field_count=len(self._allowlist.get_allowed_fields("Opportunity")),
            ),
            SalesforceObject(
                name="Account",
                label="Account",
                label_plural="Accounts",
                description="Company accounts",
                allowed_field_count=len(self._allowlist.get_allowed_fields("Account")),
            ),
            SalesforceObject(
                name="Lead",
                label="Lead",
                label_plural="Leads",
                description="Sales leads",
                allowed_field_count=len(self._allowlist.get_allowed_fields("Lead")),
            ),
            SalesforceObject(
                name="Task",
                label="Task",
                label_plural="Tasks",
                description="Activities and tasks",
                allowed_field_count=len(self._allowlist.get_allowed_fields("Task")),
            ),
        ]
        
        return supported_objects
    
    async def get_object_metadata(self, object_name: str) -> SalesforceObject:
        """
        Get detailed metadata for a Salesforce object.
        Only returns allowed fields.
        """
        # Check cache first
        if object_name in self._metadata_cache:
            return self._metadata_cache[object_name]
        
        try:
            sf = await self._get_connection()
            
            # Get object describe
            loop = asyncio.get_event_loop()
            describe = await loop.run_in_executor(
                None,
                lambda: getattr(sf, object_name).describe()
            )
            
            # Filter to allowed fields only
            allowed_fields = set(self._allowlist.get_allowed_fields(object_name))
            
            fields = []
            for field in describe.get("fields", []):
                if field["name"] in allowed_fields:
                    fields.append(SalesforceField(
                        name=field["name"],
                        label=field["label"],
                        type=field["type"],
                        is_required=not field.get("nillable", True),
                        is_updateable=field.get("updateable", False),
                        picklist_values=[
                            pv["value"] for pv in field.get("picklistValues", [])
                            if pv.get("active", True)
                        ] if field["type"] == "picklist" else None,
                        help_text=field.get("inlineHelpText"),
                    ))
            
            obj = SalesforceObject(
                name=object_name,
                label=describe.get("label", object_name),
                label_plural=describe.get("labelPlural", f"{object_name}s"),
                description=f"Salesforce {object_name} object",
                fields=fields,
                allowed_field_count=len(fields),
            )
            
            # Cache it
            self._metadata_cache[object_name] = obj
            return obj
            
        except SalesforceError as e:
            raise ValueError(f"Failed to get metadata for {object_name}: {str(e)}")
    
    async def get_records(
        self,
        object_name: str,
        filters: Optional[Dict[str, Any]] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[List[SalesforceRecord], int]:
        """
        Query records from a Salesforce object.
        Returns masked/filtered records and total count.
        """
        try:
            sf = await self._get_connection()
            
            # Build SOQL query with only allowed fields
            allowed_fields = self._allowlist.get_allowed_fields(object_name)
            fields_str = ", ".join(allowed_fields)
            
            # Base query
            query = f"SELECT {fields_str} FROM {object_name}"
            
            # Add filters
            where_clauses = []
            if filters:
                for field, value in filters.items():
                    if field in allowed_fields:  # Only filter on allowed fields
                        if isinstance(value, str):
                            where_clauses.append(f"{field} = '{value}'")
                        else:
                            where_clauses.append(f"{field} = {value}")
            
            if where_clauses:
                query += " WHERE " + " AND ".join(where_clauses)
            
            # Add ordering and limits
            query += " ORDER BY CreatedDate DESC"
            query += f" LIMIT {limit} OFFSET {offset}"
            
            # Execute query
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: sf.query(query)
            )
            
            # Process and mask records
            records = []
            for record in result.get("records", []):
                # Remove Salesforce metadata
                record_data = {k: v for k, v in record.items() if not k.startswith("attributes")}
                
                # Apply masking
                masked_data = self._masker.mask_record(record_data, allowed_fields)
                
                records.append(SalesforceRecord(
                    id=self._masker.mask_text(record.get("Id", "")),
                    object_name=object_name,
                    fields=masked_data,
                    record_type=record.get("RecordTypeId"),
                    created_date=record.get("CreatedDate"),
                ))
            
            total = result.get("totalSize", len(records))
            return records, total
            
        except SalesforceError as e:
            raise ValueError(f"Failed to query {object_name}: {str(e)}")
    
    async def get_record(
        self,
        object_name: str,
        record_id: str,
    ) -> tuple[SalesforceRecord, SafetyInfo]:
        """
        Get a single record by ID.
        Returns masked record and safety info.
        """
        try:
            sf = await self._get_connection()
            
            # Build query for single record
            allowed_fields = self._allowlist.get_allowed_fields(object_name)
            fields_str = ", ".join(allowed_fields)
            
            query = f"SELECT {fields_str} FROM {object_name} WHERE Id = '{record_id}'"
            
            # Execute query
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: sf.query(query)
            )
            
            if not result.get("records"):
                raise ValueError(f"Record not found: {record_id}")
            
            record = result["records"][0]
            
            # Get full metadata for comparison
            metadata = await self.get_object_metadata(object_name)
            total_fields = len(metadata.fields) if metadata.fields else 0
            
            # Remove Salesforce metadata
            record_data = {k: v for k, v in record.items() if not k.startswith("attributes")}
            
            # Apply masking and track what was masked
            original_text = str(record_data)
            masked_data = self._masker.mask_record(record_data, allowed_fields)
            masked_text = str(masked_data)
            
            # Count masking
            pii_masked = sum(
                masked_text.count(token) 
                for token in ["[EMAIL_REDACTED]", "[PHONE_REDACTED]", "[SF_ID_REDACTED]", "[FIELD_REDACTED]"]
            )
            
            sf_record = SalesforceRecord(
                id=self._masker.mask_text(record.get("Id", "")),
                object_name=object_name,
                fields=masked_data,
                record_type=record.get("RecordTypeId"),
                created_date=record.get("CreatedDate"),
                last_modified_date=record.get("LastModifiedDate"),
            )
            
            safety_info = SafetyInfo(
                fields_filtered=max(0, total_fields - len(allowed_fields)),
                pii_masked=pii_masked,
                allowed_fields_only=True,
                masking_applied=True,
            )
            
            return sf_record, safety_info
            
        except SalesforceError as e:
            raise ValueError(f"Failed to get record {record_id}: {str(e)}")
    
    def clear_cache(self) -> None:
        """Clear metadata cache."""
        self._metadata_cache.clear()


# Singleton instance
_salesforce_service: Optional[SalesforceService] = None


def get_salesforce_service() -> SalesforceService:
    """Get or create Salesforce service instance."""
    global _salesforce_service
    if _salesforce_service is None:
        _salesforce_service = SalesforceService()
    return _salesforce_service

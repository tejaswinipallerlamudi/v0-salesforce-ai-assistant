"""
Salesforce field allowlisting.
Only pre-approved fields are sent to AI - never customer names, emails, or free-text notes.
"""

from typing import Dict, List, Optional, Set


class FieldAllowlist:
    """
    Manages allowed Salesforce fields per object type.
    Fields not in the allowlist are excluded from AI context.
    """
    
    # Default allowed fields per Salesforce object
    # These are safe metadata fields - no PII
    DEFAULT_ALLOWLIST: Dict[str, List[str]] = {
        "Case": [
            "Id",
            "CaseNumber",
            "Status",
            "Priority",
            "Type",
            "Reason",
            "Origin",
            "Subject",  # Will be masked if contains PII
            "IsClosed",
            "IsEscalated",
            "CreatedDate",
            "ClosedDate",
            "SlaStartDate",
            "SlaExitDate",
            "RecordTypeId",
            "OwnerId",  # ID only, not name
        ],
        "Opportunity": [
            "Id",
            "Name",  # Usually company/deal name, not person
            "StageName",
            "Amount",
            "Probability",
            "Type",
            "LeadSource",
            "IsClosed",
            "IsWon",
            "ForecastCategory",
            "ForecastCategoryName",
            "CloseDate",
            "CreatedDate",
            "LastActivityDate",
            "RecordTypeId",
            "OwnerId",
        ],
        "Account": [
            "Id",
            "Name",  # Company name
            "Type",
            "Industry",
            "AnnualRevenue",
            "NumberOfEmployees",
            "Rating",
            "AccountSource",
            "Ownership",
            "CreatedDate",
            "LastActivityDate",
            "RecordTypeId",
            "OwnerId",
        ],
        "Lead": [
            "Id",
            "Status",
            "Rating",
            "LeadSource",
            "Industry",
            "AnnualRevenue",
            "NumberOfEmployees",
            "IsConverted",
            "ConvertedDate",
            "CreatedDate",
            "LastActivityDate",
            "RecordTypeId",
            "OwnerId",
        ],
        "Task": [
            "Id",
            "Subject",
            "Status",
            "Priority",
            "Type",
            "ActivityDate",
            "IsClosed",
            "IsHighPriority",
            "CreatedDate",
            "CompletedDateTime",
            "RecordTypeId",
            "OwnerId",
        ],
        "Contact": [
            # Minimal fields for Contact - mostly metadata
            "Id",
            "Title",  # Job title, not name
            "Department",
            "LeadSource",
            "CreatedDate",
            "LastActivityDate",
            "RecordTypeId",
            "OwnerId",
        ],
        # Generic fallback for unknown objects
        "_default": [
            "Id",
            "Name",
            "Status",
            "Type",
            "Priority",
            "CreatedDate",
            "LastModifiedDate",
            "RecordTypeId",
            "OwnerId",
        ],
    }
    
    # Fields that are NEVER allowed regardless of object
    BLOCKED_FIELDS: Set[str] = {
        "Email",
        "Phone",
        "MobilePhone",
        "HomePhone",
        "Fax",
        "MailingAddress",
        "BillingAddress",
        "ShippingAddress",
        "OtherAddress",
        "FirstName",
        "LastName",
        "FullName",
        "PersonalEmail",
        "PersonEmail",
        "Description",  # Often contains PII
        "Body",  # Email/task bodies
        "Comments",
        "Notes",
        "SSN",
        "SocialSecurityNumber",
        "TaxId",
        "BirthDate",
        "Birthdate",
    }
    
    def __init__(self, custom_allowlist: Optional[Dict[str, List[str]]] = None):
        """
        Initialize with optional custom allowlist that extends defaults.
        
        Args:
            custom_allowlist: Additional fields to allow per object
        """
        self.allowlist = self.DEFAULT_ALLOWLIST.copy()
        if custom_allowlist:
            for obj, fields in custom_allowlist.items():
                if obj in self.allowlist:
                    self.allowlist[obj] = list(set(self.allowlist[obj] + fields))
                else:
                    self.allowlist[obj] = fields
    
    def get_allowed_fields(self, object_name: str) -> List[str]:
        """
        Get list of allowed fields for a Salesforce object.
        
        Args:
            object_name: Name of Salesforce object (e.g., "Case")
            
        Returns:
            List of field names that are safe to use
        """
        # Get object-specific or default allowlist
        fields = self.allowlist.get(object_name, self.allowlist["_default"])
        
        # Remove any blocked fields that might have been added
        return [f for f in fields if f not in self.BLOCKED_FIELDS]
    
    def is_field_allowed(self, object_name: str, field_name: str) -> bool:
        """
        Check if a specific field is allowed.
        
        Args:
            object_name: Name of Salesforce object
            field_name: Name of field to check
            
        Returns:
            True if field is allowed, False otherwise
        """
        if field_name in self.BLOCKED_FIELDS:
            return False
        
        allowed = self.get_allowed_fields(object_name)
        return field_name in allowed
    
    def filter_fields(
        self, 
        object_name: str, 
        fields: Dict[str, any]
    ) -> Dict[str, any]:
        """
        Filter a dictionary of fields to only allowed ones.
        
        Args:
            object_name: Name of Salesforce object
            fields: Dictionary of field:value pairs
            
        Returns:
            Filtered dictionary with only allowed fields
        """
        allowed = set(self.get_allowed_fields(object_name))
        return {
            k: v for k, v in fields.items() 
            if k in allowed and k not in self.BLOCKED_FIELDS
        }
    
    def add_allowed_field(self, object_name: str, field_name: str) -> None:
        """
        Add a field to the allowlist for an object.
        Will not add if field is in BLOCKED_FIELDS.
        """
        if field_name in self.BLOCKED_FIELDS:
            raise ValueError(f"Cannot add blocked field: {field_name}")
        
        if object_name not in self.allowlist:
            self.allowlist[object_name] = []
        
        if field_name not in self.allowlist[object_name]:
            self.allowlist[object_name].append(field_name)


# Default instance
_default_allowlist = FieldAllowlist()


def get_allowed_fields(object_name: str) -> List[str]:
    """Get allowed fields using default allowlist."""
    return _default_allowlist.get_allowed_fields(object_name)

"""
PII (Personally Identifiable Information) detection and masking.
Ensures no sensitive data is sent to AI models.
"""

import re
from typing import Any, Dict, List, Optional


class PIIMasker:
    """
    Detects and masks PII in text and structured data.
    """
    
    # Regex patterns for common PII
    PATTERNS = {
        "email": (
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            "[EMAIL_REDACTED]"
        ),
        "phone_us": (
            r'\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
            "[PHONE_REDACTED]"
        ),
        "phone_intl": (
            r'\b\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b',
            "[PHONE_REDACTED]"
        ),
        "ssn": (
            r'\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b',
            "[SSN_REDACTED]"
        ),
        "credit_card": (
            r'\b(?:\d{4}[-.\s]?){3}\d{4}\b',
            "[CARD_REDACTED]"
        ),
        "salesforce_id": (
            r'\b[a-zA-Z0-9]{15}(?:[a-zA-Z0-9]{3})?\b',  # 15 or 18 char SF IDs
            "[SF_ID_REDACTED]"
        ),
        "ip_address": (
            r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
            "[IP_REDACTED]"
        ),
        "date_of_birth": (
            r'\b(?:DOB|Date of Birth|Birth Date)[:\s]*\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}\b',
            "[DOB_REDACTED]"
        ),
    }
    
    # Fields that should always be masked regardless of content
    SENSITIVE_FIELDS = {
        "email", "emailaddress", "email_address", "contactemail",
        "phone", "phonenumber", "phone_number", "mobilephone", "homephone", "fax",
        "ssn", "social_security", "socialsecuritynumber",
        "creditcard", "credit_card", "cardnumber",
        "password", "secret", "token", "apikey", "api_key",
        "address", "street", "streetaddress", "mailingaddress", "billingaddress",
        "firstname", "first_name", "lastname", "last_name", "fullname", "full_name",
        "name",  # Generic name fields
        "contactname", "ownername", "createdbyname",
        "description", "comments", "notes",  # Free text fields often contain PII
    }
    
    def __init__(self, enabled: bool = True):
        """Initialize masker with optional disable for testing."""
        self.enabled = enabled
        self._compiled_patterns = {
            name: (re.compile(pattern, re.IGNORECASE), replacement)
            for name, (pattern, replacement) in self.PATTERNS.items()
        }
    
    def mask_text(self, text: str) -> str:
        """
        Mask all detected PII patterns in text.
        
        Args:
            text: Input text to scan and mask
            
        Returns:
            Text with PII replaced by redaction tokens
        """
        if not self.enabled or not text:
            return text
        
        masked = text
        for name, (pattern, replacement) in self._compiled_patterns.items():
            masked = pattern.sub(replacement, masked)
        
        return masked
    
    def mask_record(
        self, 
        record: Dict[str, Any], 
        allowed_fields: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Mask PII in a Salesforce record dictionary.
        
        Args:
            record: Dictionary of field:value pairs
            allowed_fields: Optional list of fields to include (others are dropped)
            
        Returns:
            Record with PII masked and optionally filtered to allowed fields
        """
        if not self.enabled:
            return record
        
        masked_record = {}
        
        for field, value in record.items():
            field_lower = field.lower()
            
            # Skip if not in allowed fields (when specified)
            if allowed_fields and field_lower not in [f.lower() for f in allowed_fields]:
                continue
            
            # Check if field is inherently sensitive
            if self._is_sensitive_field(field_lower):
                masked_record[field] = "[FIELD_REDACTED]"
                continue
            
            # Mask any PII found in the value
            if isinstance(value, str):
                masked_record[field] = self.mask_text(value)
            elif isinstance(value, dict):
                # Recursively mask nested objects
                masked_record[field] = self.mask_record(value, allowed_fields)
            elif isinstance(value, list):
                # Handle lists of strings or dicts
                masked_record[field] = [
                    self.mask_text(v) if isinstance(v, str) 
                    else self.mask_record(v, allowed_fields) if isinstance(v, dict)
                    else v
                    for v in value
                ]
            else:
                masked_record[field] = value
        
        return masked_record
    
    def _is_sensitive_field(self, field_name: str) -> bool:
        """Check if a field name indicates sensitive data."""
        field_lower = field_name.lower().replace("__c", "")  # Remove SF custom suffix
        
        # Direct match
        if field_lower in self.SENSITIVE_FIELDS:
            return True
        
        # Partial match for compound names
        for sensitive in self.SENSITIVE_FIELDS:
            if sensitive in field_lower:
                return True
        
        return False
    
    def get_masking_summary(self, original: str, masked: str) -> Dict[str, int]:
        """
        Get summary of what was masked.
        
        Returns:
            Dictionary with counts of each type of PII found
        """
        summary = {}
        for name, (pattern, replacement) in self._compiled_patterns.items():
            matches = pattern.findall(original)
            if matches:
                summary[name] = len(matches)
        return summary


# Convenience functions
_default_masker = PIIMasker()


def mask_text(text: str) -> str:
    """Mask PII in text using default masker."""
    return _default_masker.mask_text(text)


def mask_record(record: Dict[str, Any], allowed_fields: Optional[List[str]] = None) -> Dict[str, Any]:
    """Mask PII in record using default masker."""
    return _default_masker.mask_record(record, allowed_fields)

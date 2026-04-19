"""
Role-based access control and guardrails.
Controls what each role can access and do.
"""

from enum import Enum
from typing import List, Optional, Set

from app.models.user import Role


class Permission(str, Enum):
    """Available permissions in the system."""
    # Salesforce Buddy permissions
    VIEW_OBJECTS = "view_objects"
    VIEW_RECORDS = "view_records"
    EXPLAIN_PAGE = "explain_page"
    ASK_QUESTION = "ask_question"
    GUIDED_STEPS = "guided_steps"
    
    # Project Intelligence permissions
    VIEW_INSIGHTS = "view_insights"
    VIEW_RISKS = "view_risks"
    VIEW_SIMILAR_PROJECTS = "view_similar_projects"
    VIEW_RECOMMENDATIONS = "view_recommendations"
    GENERATE_SUMMARY = "generate_summary"
    
    # Knowledge permissions
    SEARCH_KNOWLEDGE = "search_knowledge"
    VIEW_SOPS = "view_sops"
    VIEW_TEMPLATES = "view_templates"
    
    # Admin permissions
    VIEW_AUDIT_LOGS = "view_audit_logs"
    VIEW_MASKED_CONTEXT = "view_masked_context"
    VIEW_RETRIEVED_SOURCES = "view_retrieved_sources"
    MANAGE_USERS = "manage_users"
    CONFIGURE_ALLOWLIST = "configure_allowlist"


class RoleGuardrails:
    """
    Manages role-based access control.
    """
    
    # Permission mapping per role
    ROLE_PERMISSIONS: dict[Role, Set[Permission]] = {
        Role.INTERN: {
            # Basic Salesforce Buddy features
            Permission.VIEW_OBJECTS,
            Permission.VIEW_RECORDS,
            Permission.EXPLAIN_PAGE,
            Permission.ASK_QUESTION,
            Permission.GUIDED_STEPS,
            # Basic knowledge access
            Permission.SEARCH_KNOWLEDGE,
            Permission.VIEW_SOPS,
            Permission.VIEW_TEMPLATES,
        },
        Role.LEAD: {
            # All intern permissions
            Permission.VIEW_OBJECTS,
            Permission.VIEW_RECORDS,
            Permission.EXPLAIN_PAGE,
            Permission.ASK_QUESTION,
            Permission.GUIDED_STEPS,
            Permission.SEARCH_KNOWLEDGE,
            Permission.VIEW_SOPS,
            Permission.VIEW_TEMPLATES,
            # Plus project intelligence
            Permission.VIEW_INSIGHTS,
            Permission.VIEW_RISKS,
            Permission.VIEW_SIMILAR_PROJECTS,
            Permission.VIEW_RECOMMENDATIONS,
            Permission.GENERATE_SUMMARY,
        },
        Role.ADMIN: {
            # All permissions
            Permission.VIEW_OBJECTS,
            Permission.VIEW_RECORDS,
            Permission.EXPLAIN_PAGE,
            Permission.ASK_QUESTION,
            Permission.GUIDED_STEPS,
            Permission.SEARCH_KNOWLEDGE,
            Permission.VIEW_SOPS,
            Permission.VIEW_TEMPLATES,
            Permission.VIEW_INSIGHTS,
            Permission.VIEW_RISKS,
            Permission.VIEW_SIMILAR_PROJECTS,
            Permission.VIEW_RECOMMENDATIONS,
            Permission.GENERATE_SUMMARY,
            # Plus admin features
            Permission.VIEW_AUDIT_LOGS,
            Permission.VIEW_MASKED_CONTEXT,
            Permission.VIEW_RETRIEVED_SOURCES,
            Permission.MANAGE_USERS,
            Permission.CONFIGURE_ALLOWLIST,
        },
    }
    
    # Salesforce objects each role can access
    ROLE_OBJECT_ACCESS: dict[Role, Optional[Set[str]]] = {
        Role.INTERN: {"Case", "Task"},  # Limited to support objects
        Role.LEAD: None,  # All objects
        Role.ADMIN: None,  # All objects
    }
    
    def __init__(self, role: Role):
        """Initialize guardrails for a specific role."""
        self.role = role
        self.permissions = self.ROLE_PERMISSIONS.get(role, set())
        self.object_access = self.ROLE_OBJECT_ACCESS.get(role)
    
    def has_permission(self, permission: Permission) -> bool:
        """Check if role has a specific permission."""
        return permission in self.permissions
    
    def can_access_object(self, object_name: str) -> bool:
        """Check if role can access a Salesforce object."""
        if self.object_access is None:
            return True  # None means all objects
        return object_name in self.object_access
    
    def filter_objects(self, objects: List[str]) -> List[str]:
        """Filter list of objects to only accessible ones."""
        if self.object_access is None:
            return objects
        return [obj for obj in objects if obj in self.object_access]
    
    def get_accessible_features(self) -> List[str]:
        """Get list of features available to this role."""
        features = []
        
        if Permission.EXPLAIN_PAGE in self.permissions:
            features.append("explain_page")
        if Permission.ASK_QUESTION in self.permissions:
            features.append("ask_question")
        if Permission.GUIDED_STEPS in self.permissions:
            features.append("guided_steps")
        if Permission.VIEW_INSIGHTS in self.permissions:
            features.append("project_intelligence")
        if Permission.VIEW_AUDIT_LOGS in self.permissions:
            features.append("admin_panel")
        
        return features


def check_access(role: Role, permission: Permission) -> bool:
    """Quick check if a role has a permission."""
    guardrails = RoleGuardrails(role)
    return guardrails.has_permission(permission)


def get_role_from_string(role_str: str) -> Role:
    """Convert string to Role enum, defaulting to INTERN."""
    try:
        return Role(role_str.lower())
    except ValueError:
        return Role.INTERN

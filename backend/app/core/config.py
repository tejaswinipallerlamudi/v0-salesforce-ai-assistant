"""
Application configuration using Pydantic Settings.
Loads from environment variables with validation.
"""

from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App
    app_name: str = "CSX AI Delivery Fabric"
    debug: bool = False
    
    # Database
    database_url: str = "postgresql+asyncpg://localhost:5432/csx_fabric"
    
    # Salesforce
    salesforce_client_id: str = ""
    salesforce_client_secret: str = ""
    salesforce_username: str = ""
    salesforce_password: str = ""
    salesforce_security_token: str = ""
    salesforce_domain: str = "login.salesforce.com"
    
    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    
    # Security
    secret_key: str = "change-me-in-production"
    allowed_origins: str = "http://localhost:3000"
    
    # Features
    enable_audit_logging: bool = True
    enable_pii_masking: bool = True
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse comma-separated origins into list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    @property
    def salesforce_login_url(self) -> str:
        """Full Salesforce login URL."""
        return f"https://{self.salesforce_domain}"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()

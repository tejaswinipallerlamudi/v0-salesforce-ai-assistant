"""
Knowledge layer models: SOPs, KT notes, project histories, embeddings.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import String, DateTime, Text, JSON, Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.core.database import Base


class KnowledgeSourceType(str, Enum):
    """Types of knowledge sources."""
    SOP = "sop"                      # Standard Operating Procedure
    KT_NOTE = "kt_note"              # Knowledge Transfer note
    PROJECT_HISTORY = "project"     # Historical project data
    TEMPLATE = "template"            # Reusable templates
    FIELD_GUIDE = "field_guide"      # Field explanation guides


class SOPDocument(Base):
    """
    Standard Operating Procedure documents.
    Contains process guides, escalation procedures, approval workflows.
    """
    
    __tablename__ = "sop_documents"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(500), index=True)
    category: Mapped[str] = mapped_column(String(100), index=True)  # e.g., "escalation", "approval", "case_handling"
    content: Mapped[str] = mapped_column(Text)
    
    # Metadata
    version: Mapped[str] = mapped_column(String(20), default="1.0")
    tags: Mapped[list] = mapped_column(JSON, default=list)  # ["priority", "case", "escalation"]
    
    # Related Salesforce objects this SOP applies to
    applies_to_objects: Mapped[list] = mapped_column(JSON, default=list)  # ["Case", "Opportunity"]
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    # Relationship to embeddings
    embeddings: Mapped[list["VectorEmbedding"]] = relationship(
        "VectorEmbedding",
        back_populates="sop_document",
        lazy="selectin",
        foreign_keys="VectorEmbedding.sop_document_id"
    )
    
    def __repr__(self) -> str:
        return f"<SOPDocument {self.title}>"


class ProjectHistory(Base):
    """
    Historical project data with lessons learned.
    Used for similar project matching and insights.
    """
    
    __tablename__ = "project_histories"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_name: Mapped[str] = mapped_column(String(500), index=True)
    description: Mapped[str] = mapped_column(Text)
    
    # Project details
    client_industry: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    project_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    duration_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    team_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Outcomes and learnings
    outcome: Mapped[str] = mapped_column(String(50), default="completed")  # completed, cancelled, escalated
    lessons_learned: Mapped[str] = mapped_column(Text, default="")
    risks_encountered: Mapped[list] = mapped_column(JSON, default=list)
    solutions_applied: Mapped[list] = mapped_column(JSON, default=list)
    
    # Tags for matching
    tags: Mapped[list] = mapped_column(JSON, default=list)
    
    # Timestamps
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationship to embeddings
    embeddings: Mapped[list["VectorEmbedding"]] = relationship(
        "VectorEmbedding",
        back_populates="project_history",
        lazy="selectin",
        foreign_keys="VectorEmbedding.project_history_id"
    )
    
    def __repr__(self) -> str:
        return f"<ProjectHistory {self.project_name}>"


class KnowledgeSource(Base):
    """
    Generic knowledge source for KT notes, field guides, templates.
    """
    
    __tablename__ = "knowledge_sources"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    source_type: Mapped[str] = mapped_column(String(50), index=True)  # KnowledgeSourceType
    title: Mapped[str] = mapped_column(String(500), index=True)
    content: Mapped[str] = mapped_column(Text)
    
    # Metadata
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    
    # For field guides: which SF object/field this explains
    related_object: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    related_field: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )
    
    # Relationship to embeddings
    embeddings: Mapped[list["VectorEmbedding"]] = relationship(
        "VectorEmbedding",
        back_populates="knowledge_source",
        lazy="selectin",
        foreign_keys="VectorEmbedding.knowledge_source_id"
    )
    
    def __repr__(self) -> str:
        return f"<KnowledgeSource {self.source_type}: {self.title}>"


class VectorEmbedding(Base):
    """
    Vector embeddings for semantic search using pgvector.
    Links to various knowledge sources.
    """
    
    __tablename__ = "vector_embeddings"
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    
    # The text that was embedded
    text_content: Mapped[str] = mapped_column(Text)
    
    # The embedding vector (1536 dimensions for OpenAI text-embedding-3-small)
    embedding: Mapped[list] = mapped_column(Vector(1536))
    
    # Foreign keys to source documents (only one will be set)
    sop_document_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("sop_documents.id", ondelete="CASCADE"), 
        nullable=True
    )
    project_history_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("project_histories.id", ondelete="CASCADE"), 
        nullable=True
    )
    knowledge_source_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("knowledge_sources.id", ondelete="CASCADE"), 
        nullable=True
    )
    
    # Chunk metadata (for long documents split into chunks)
    chunk_index: Mapped[int] = mapped_column(Integer, default=0)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    sop_document: Mapped[Optional["SOPDocument"]] = relationship(
        "SOPDocument", 
        back_populates="embeddings",
        foreign_keys=[sop_document_id]
    )
    project_history: Mapped[Optional["ProjectHistory"]] = relationship(
        "ProjectHistory", 
        back_populates="embeddings",
        foreign_keys=[project_history_id]
    )
    knowledge_source: Mapped[Optional["KnowledgeSource"]] = relationship(
        "KnowledgeSource", 
        back_populates="embeddings",
        foreign_keys=[knowledge_source_id]
    )
    
    __table_args__ = (
        Index(
            "ix_vector_embeddings_embedding",
            "embedding",
            postgresql_using="ivfflat",
            postgresql_with={"lists": 100},
            postgresql_ops={"embedding": "vector_cosine_ops"}
        ),
    )
    
    def __repr__(self) -> str:
        source = "unknown"
        if self.sop_document_id:
            source = f"SOP:{self.sop_document_id}"
        elif self.project_history_id:
            source = f"Project:{self.project_history_id}"
        elif self.knowledge_source_id:
            source = f"Knowledge:{self.knowledge_source_id}"
        return f"<VectorEmbedding {source}>"

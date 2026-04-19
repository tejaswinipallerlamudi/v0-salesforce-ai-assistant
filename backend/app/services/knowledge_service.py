"""
Knowledge ingestion and management service.
Handles SOPs, KT notes, project histories, and templates.
"""

from typing import List, Optional
import asyncio

from openai import OpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db_context
from app.models.knowledge import (
    SOPDocument,
    ProjectHistory,
    KnowledgeSource,
    VectorEmbedding,
    KnowledgeSourceType,
)

settings = get_settings()


class KnowledgeService:
    """
    Service for managing knowledge base content.
    Handles ingestion, embedding generation, and retrieval.
    """
    
    def __init__(self):
        self._openai = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
        self._embedding_model = settings.openai_embedding_model
        self._chunk_size = 1000  # Characters per chunk
        self._chunk_overlap = 200
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for text using OpenAI."""
        if not self._openai:
            # Return zero vector if OpenAI not configured
            return [0.0] * 1536
        
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self._openai.embeddings.create(
                model=self._embedding_model,
                input=text,
            )
        )
        return response.data[0].embedding
    
    def _chunk_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks for embedding."""
        if len(text) <= self._chunk_size:
            return [text]
        
        chunks = []
        start = 0
        while start < len(text):
            end = min(start + self._chunk_size, len(text))
            # Try to break at sentence boundary
            if end < len(text):
                last_period = text.rfind(".", start, end)
                if last_period > start + self._chunk_size // 2:
                    end = last_period + 1
            
            chunks.append(text[start:end])
            start = end - self._chunk_overlap
        
        return chunks
    
    async def add_sop_document(
        self,
        db: AsyncSession,
        title: str,
        category: str,
        content: str,
        tags: List[str] = None,
        applies_to_objects: List[str] = None,
    ) -> SOPDocument:
        """Add an SOP document and generate embeddings."""
        # Create document
        sop = SOPDocument(
            title=title,
            category=category,
            content=content,
            tags=tags or [],
            applies_to_objects=applies_to_objects or [],
        )
        db.add(sop)
        await db.flush()  # Get ID
        
        # Generate embeddings for chunks
        chunks = self._chunk_text(content)
        for i, chunk in enumerate(chunks):
            embedding = await self.generate_embedding(chunk)
            vec_embedding = VectorEmbedding(
                text_content=chunk,
                embedding=embedding,
                sop_document_id=sop.id,
                chunk_index=i,
            )
            db.add(vec_embedding)
        
        await db.commit()
        return sop
    
    async def add_project_history(
        self,
        db: AsyncSession,
        project_name: str,
        description: str,
        client_industry: str = None,
        project_type: str = None,
        duration_days: int = None,
        outcome: str = "completed",
        lessons_learned: str = "",
        risks_encountered: List[str] = None,
        solutions_applied: List[str] = None,
        tags: List[str] = None,
    ) -> ProjectHistory:
        """Add a project history record and generate embeddings."""
        project = ProjectHistory(
            project_name=project_name,
            description=description,
            client_industry=client_industry,
            project_type=project_type,
            duration_days=duration_days,
            outcome=outcome,
            lessons_learned=lessons_learned,
            risks_encountered=risks_encountered or [],
            solutions_applied=solutions_applied or [],
            tags=tags or [],
        )
        db.add(project)
        await db.flush()
        
        # Combine text for embedding
        full_text = f"{description}\n\nLessons: {lessons_learned}"
        chunks = self._chunk_text(full_text)
        
        for i, chunk in enumerate(chunks):
            embedding = await self.generate_embedding(chunk)
            vec_embedding = VectorEmbedding(
                text_content=chunk,
                embedding=embedding,
                project_history_id=project.id,
                chunk_index=i,
            )
            db.add(vec_embedding)
        
        await db.commit()
        return project
    
    async def add_knowledge_source(
        self,
        db: AsyncSession,
        source_type: str,
        title: str,
        content: str,
        category: str = None,
        tags: List[str] = None,
        related_object: str = None,
        related_field: str = None,
    ) -> KnowledgeSource:
        """Add a generic knowledge source (KT note, field guide, template)."""
        source = KnowledgeSource(
            source_type=source_type,
            title=title,
            content=content,
            category=category,
            tags=tags or [],
            related_object=related_object,
            related_field=related_field,
        )
        db.add(source)
        await db.flush()
        
        # Generate embeddings
        chunks = self._chunk_text(content)
        for i, chunk in enumerate(chunks):
            embedding = await self.generate_embedding(chunk)
            vec_embedding = VectorEmbedding(
                text_content=chunk,
                embedding=embedding,
                knowledge_source_id=source.id,
                chunk_index=i,
            )
            db.add(vec_embedding)
        
        await db.commit()
        return source
    
    async def get_all_sops(self, db: AsyncSession) -> List[SOPDocument]:
        """Get all SOP documents."""
        result = await db.execute(select(SOPDocument).order_by(SOPDocument.title))
        return list(result.scalars().all())
    
    async def get_sops_by_category(
        self,
        db: AsyncSession,
        category: str,
    ) -> List[SOPDocument]:
        """Get SOPs by category."""
        result = await db.execute(
            select(SOPDocument)
            .where(SOPDocument.category == category)
            .order_by(SOPDocument.title)
        )
        return list(result.scalars().all())
    
    async def get_all_projects(self, db: AsyncSession) -> List[ProjectHistory]:
        """Get all project histories."""
        result = await db.execute(
            select(ProjectHistory).order_by(ProjectHistory.project_name)
        )
        return list(result.scalars().all())
    
    async def get_knowledge_by_object(
        self,
        db: AsyncSession,
        object_name: str,
    ) -> List[KnowledgeSource]:
        """Get knowledge sources related to a Salesforce object."""
        result = await db.execute(
            select(KnowledgeSource)
            .where(KnowledgeSource.related_object == object_name)
            .order_by(KnowledgeSource.title)
        )
        return list(result.scalars().all())


# Singleton
_knowledge_service: Optional[KnowledgeService] = None


def get_knowledge_service() -> KnowledgeService:
    """Get or create knowledge service instance."""
    global _knowledge_service
    if _knowledge_service is None:
        _knowledge_service = KnowledgeService()
    return _knowledge_service

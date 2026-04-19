"""
Semantic retrieval service using pgvector.
Finds relevant knowledge for AI context.
"""

from typing import List, Optional, Tuple
import asyncio

from openai import OpenAI
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.knowledge import VectorEmbedding, SOPDocument, ProjectHistory, KnowledgeSource
from app.schemas.context import RetrievedSource

settings = get_settings()


class RetrievalService:
    """
    Service for semantic search and knowledge retrieval.
    Uses pgvector for similarity search.
    """
    
    def __init__(self):
        self._openai = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
        self._embedding_model = settings.openai_embedding_model
    
    async def _generate_query_embedding(self, query: str) -> List[float]:
        """Generate embedding for search query."""
        if not self._openai:
            return [0.0] * 1536
        
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self._openai.embeddings.create(
                model=self._embedding_model,
                input=query,
            )
        )
        return response.data[0].embedding
    
    async def search_similar(
        self,
        db: AsyncSession,
        query: str,
        limit: int = 5,
        source_types: Optional[List[str]] = None,
        min_similarity: float = 0.5,
    ) -> List[RetrievedSource]:
        """
        Search for similar content using vector similarity.
        
        Args:
            db: Database session
            query: Search query text
            limit: Maximum results to return
            source_types: Filter by source type (sop, project, knowledge)
            min_similarity: Minimum similarity threshold (0-1)
        """
        # Generate query embedding
        query_embedding = await self._generate_query_embedding(query)
        embedding_str = f"[{','.join(str(x) for x in query_embedding)}]"
        
        # Build similarity search query
        # Using cosine similarity: 1 - (embedding <=> query_embedding)
        sql = text("""
            SELECT 
                ve.id,
                ve.text_content,
                ve.sop_document_id,
                ve.project_history_id,
                ve.knowledge_source_id,
                1 - (ve.embedding <=> :embedding::vector) as similarity
            FROM vector_embeddings ve
            WHERE 1 - (ve.embedding <=> :embedding::vector) > :min_similarity
            ORDER BY ve.embedding <=> :embedding::vector
            LIMIT :limit
        """)
        
        result = await db.execute(
            sql,
            {
                "embedding": embedding_str,
                "min_similarity": min_similarity,
                "limit": limit * 2,  # Get extra to filter by type
            }
        )
        
        rows = result.fetchall()
        
        # Fetch source details and build results
        sources = []
        seen_sources = set()
        
        for row in rows:
            vec_id, text_content, sop_id, project_id, knowledge_id, similarity = row
            
            # Determine source type
            if sop_id:
                source_type = "sop"
                source_id = sop_id
                key = f"sop_{sop_id}"
            elif project_id:
                source_type = "project"
                source_id = project_id
                key = f"project_{project_id}"
            elif knowledge_id:
                source_type = "knowledge"
                source_id = knowledge_id
                key = f"knowledge_{knowledge_id}"
            else:
                continue
            
            # Filter by source type if specified
            if source_types and source_type not in source_types:
                continue
            
            # Skip duplicates (same source, different chunks)
            if key in seen_sources:
                continue
            seen_sources.add(key)
            
            # Get source title
            title = await self._get_source_title(db, source_type, source_id)
            
            sources.append(RetrievedSource(
                source_type=source_type,
                source_id=source_id,
                title=title,
                relevance_score=float(similarity),
                snippet=text_content[:200] + "..." if len(text_content) > 200 else text_content,
            ))
            
            if len(sources) >= limit:
                break
        
        return sources
    
    async def _get_source_title(
        self,
        db: AsyncSession,
        source_type: str,
        source_id: int,
    ) -> str:
        """Get title for a source document."""
        if source_type == "sop":
            result = await db.execute(
                select(SOPDocument.title).where(SOPDocument.id == source_id)
            )
            title = result.scalar()
            return title or f"SOP #{source_id}"
        
        elif source_type == "project":
            result = await db.execute(
                select(ProjectHistory.project_name).where(ProjectHistory.id == source_id)
            )
            title = result.scalar()
            return title or f"Project #{source_id}"
        
        elif source_type == "knowledge":
            result = await db.execute(
                select(KnowledgeSource.title).where(KnowledgeSource.id == source_id)
            )
            title = result.scalar()
            return title or f"Knowledge #{source_id}"
        
        return f"Source #{source_id}"
    
    async def get_sops_for_object(
        self,
        db: AsyncSession,
        object_name: str,
        limit: int = 5,
    ) -> List[RetrievedSource]:
        """Get SOPs that apply to a Salesforce object."""
        # Query SOPs that have this object in applies_to_objects
        result = await db.execute(
            select(SOPDocument)
            .where(SOPDocument.applies_to_objects.contains([object_name]))
            .limit(limit)
        )
        
        sops = result.scalars().all()
        
        return [
            RetrievedSource(
                source_type="sop",
                source_id=sop.id,
                title=sop.title,
                relevance_score=1.0,  # Direct match
                snippet=sop.content[:200] + "..." if len(sop.content) > 200 else sop.content,
            )
            for sop in sops
        ]
    
    async def get_field_guides(
        self,
        db: AsyncSession,
        object_name: str,
        field_name: Optional[str] = None,
    ) -> List[RetrievedSource]:
        """Get field guides for a Salesforce object/field."""
        query = select(KnowledgeSource).where(
            KnowledgeSource.source_type == "field_guide",
            KnowledgeSource.related_object == object_name,
        )
        
        if field_name:
            query = query.where(KnowledgeSource.related_field == field_name)
        
        result = await db.execute(query)
        guides = result.scalars().all()
        
        return [
            RetrievedSource(
                source_type="field_guide",
                source_id=guide.id,
                title=guide.title,
                relevance_score=1.0,
                snippet=guide.content[:200] + "..." if len(guide.content) > 200 else guide.content,
            )
            for guide in guides
        ]
    
    async def find_similar_projects(
        self,
        db: AsyncSession,
        description: str,
        industry: Optional[str] = None,
        project_type: Optional[str] = None,
        limit: int = 5,
    ) -> List[Tuple[ProjectHistory, float]]:
        """
        Find similar historical projects.
        Returns projects with similarity scores.
        """
        # First try semantic search
        sources = await self.search_similar(
            db=db,
            query=description,
            limit=limit,
            source_types=["project"],
        )
        
        # Get full project records
        results = []
        for source in sources:
            result = await db.execute(
                select(ProjectHistory).where(ProjectHistory.id == source.source_id)
            )
            project = result.scalar()
            if project:
                # Boost similarity if industry/type matches
                similarity = source.relevance_score
                if industry and project.client_industry == industry:
                    similarity = min(1.0, similarity + 0.1)
                if project_type and project.project_type == project_type:
                    similarity = min(1.0, similarity + 0.1)
                
                results.append((project, similarity))
        
        # Sort by similarity
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:limit]


# Singleton
_retrieval_service: Optional[RetrievalService] = None


def get_retrieval_service() -> RetrievalService:
    """Get or create retrieval service instance."""
    global _retrieval_service
    if _retrieval_service is None:
        _retrieval_service = RetrievalService()
    return _retrieval_service

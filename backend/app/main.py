"""
CSX AI Delivery Fabric - FastAPI Application Entry Point.
"""

from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.database import init_db
from app.api import health, salesforce, context, ai, insights, audit

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events."""
    # Startup
    print(f"Starting {settings.app_name}...")
    try:
        await init_db()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization warning: {e}")
        print("Continuing without database - some features may be limited")
    
    yield
    
    # Shutdown
    print(f"Shutting down {settings.app_name}...")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="""
    CSX AI Delivery Fabric with Salesforce Buddy.
    
    A two-layer enterprise AI assistant:
    - **Salesforce Buddy** (Micro Layer): Page explanations, field guidance, KT support for interns
    - **Project Intelligence Copilot** (Macro Layer): Cross-project insights, risk detection for leads
    
    All data is filtered through field allowlisting and PII masking before AI processing.
    """,
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(salesforce.router, prefix="/api/salesforce", tags=["Salesforce"])
app.include_router(context.router, prefix="/api/context", tags=["Context"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(insights.router, prefix="/api/insights", tags=["Insights"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit"])


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "features": [
            "Salesforce Buddy - Page explanations",
            "Safe Q&A - SOP-based answers",
            "Guided Steps - Workflow checklists",
            "Project Intelligence - Cross-project insights",
            "Risk Detection - Proactive risk alerts",
            "Knowledge Retrieval - Semantic search",
        ],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )

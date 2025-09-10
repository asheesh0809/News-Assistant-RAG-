from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import asyncio
import logging
from datetime import datetime
import os
from dotenv import load_dotenv

from services.rag_service import RAGService
from services.rss_service import RSSService
from models.schemas import QuestionRequest, QuestionResponse, RebuildResponse, SourcesResponse

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="RAG News Assistant API",
    description="Retrieval-Augmented Generation API for news questions",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
rag_service = RAGService()
rss_service = RSSService()

# Global state for rebuild progress
rebuild_status = {"in_progress": False, "progress": 0, "message": ""}

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        await rag_service.initialize()
        logger.info("RAG service initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize RAG service: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.post("/ask", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    """Process a question using RAG"""
    try:
        if not request.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        logger.info(f"Processing question: {request.question[:100]}...")
        
        # Get answer from RAG service
        result = await rag_service.ask_question(request.question)
        
        return QuestionResponse(
            answer=result["answer"],
            citations=result["citations"],
            processing_time=result.get("processing_time", 0)
        )
        
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ingest/sources", response_model=SourcesResponse)
async def get_sources():
    """Get list of RSS sources"""
    try:
        sources = await rss_service.get_sources()
        return SourcesResponse(rss=sources)
    except Exception as e:
        logger.error(f"Error getting sources: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingest/rebuild", response_model=RebuildResponse)
async def rebuild_index(background_tasks: BackgroundTasks):
    """Rebuild the vector index from RSS sources"""
    global rebuild_status
    
    if rebuild_status["in_progress"]:
        raise HTTPException(status_code=409, detail="Rebuild already in progress")
    
    try:
        # Start rebuild in background
        background_tasks.add_task(perform_rebuild)
        rebuild_status["in_progress"] = True
        rebuild_status["progress"] = 0
        rebuild_status["message"] = "Starting rebuild..."
        
        return RebuildResponse(
            status="started",
            message="Index rebuild started in background"
        )
        
    except Exception as e:
        logger.error(f"Error starting rebuild: {e}")
        rebuild_status["in_progress"] = False
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ingest/rebuild/status")
async def get_rebuild_status():
    """Get current rebuild status"""
    return rebuild_status

async def perform_rebuild():
    """Perform the actual index rebuild"""
    global rebuild_status
    
    try:
        rebuild_status["message"] = "Fetching RSS feeds..."
        rebuild_status["progress"] = 10
        
        # Fetch articles from RSS feeds
        articles = await rss_service.fetch_all_articles()
        rebuild_status["progress"] = 40
        rebuild_status["message"] = f"Processing {len(articles)} articles..."
        
        # Rebuild the RAG index
        result = await rag_service.rebuild_index(articles)
        rebuild_status["progress"] = 90
        
        rebuild_status["progress"] = 100
        rebuild_status["message"] = "Rebuild completed successfully"
        rebuild_status["articles"] = result["articles"]
        rebuild_status["chunks"] = result["chunks"]
        
        # Reset status after a delay
        await asyncio.sleep(5)
        rebuild_status["in_progress"] = False
        
    except Exception as e:
        logger.error(f"Error during rebuild: {e}")
        rebuild_status["in_progress"] = False
        rebuild_status["message"] = f"Rebuild failed: {str(e)}"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

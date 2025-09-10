from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class QuestionRequest(BaseModel):
    question: str

class Citation(BaseModel):
    id: str
    title: str
    url: str
    snippet: str
    timestamp: str
    source: Optional[str] = None

class QuestionResponse(BaseModel):
    answer: str
    citations: List[Citation]
    processing_time: Optional[float] = None

class SourcesResponse(BaseModel):
    rss: List[str]

class RebuildResponse(BaseModel):
    status: str
    message: str
    articles: Optional[int] = None
    chunks: Optional[int] = None

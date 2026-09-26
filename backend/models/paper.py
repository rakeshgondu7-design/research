from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PaperBase(BaseModel):
    title: str
    abstract: Optional[str] = None
    keywords: List[str] = []
    authors: List[str] = []
    publication_year: Optional[int] = None
    citation_count: int = 0
    references: List[str] = []
    metadata: dict = {}

class PaperCreate(PaperBase):
    project_id: str
    pdf_text: Optional[str] = None

class PaperInDB(PaperBase):
    id: str = Field(alias="_id")
    project_id: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

class PaperResponse(PaperBase):
    id: str
    project_id: str
    uploaded_at: datetime

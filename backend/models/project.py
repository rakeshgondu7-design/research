from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ProjectBase(BaseModel):
    name: Optional[str] = "Untitled Research Project"
    description: Optional[str] = None
    topic: Optional[str] = ""

class ProjectCreate(ProjectBase):
    pass

class ProjectInDB(ProjectBase):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    paper_count: int = 0
    
    class Config:
        populate_by_name = True

class ProjectResponse(ProjectBase):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime
    updated_at: datetime
    paper_count: int
    
    class Config:
        populate_by_name = True

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List
from models.user import UserResponse
from models.project import ProjectCreate, ProjectResponse, ProjectInDB
from models.paper import PaperResponse, PaperInDB, PaperCreate
from routes.auth_routes import get_current_user
from config.database import get_database
from services.pdf_service import PDFService
import uuid

router = APIRouter()

@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    project_id = str(uuid.uuid4())
    
    project_db = ProjectInDB(
        _id=project_id,
        user_id=current_user.id,
        name=project.name,
        description=project.description,
        topic=project.topic
    )
    
    await db.projects.insert_one(project_db.dict(by_alias=True))
    return ProjectResponse(**project_db.dict())

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    cursor = db.projects.find({"user_id": current_user.id})
    projects = await cursor.to_list(length=100)
    return [ProjectResponse(**p) for p in projects]

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    project = await db.projects.find_one({"_id": project_id, "user_id": current_user.id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse(**project)

@router.post("/{project_id}/papers", response_model=PaperResponse)
async def upload_paper(
    project_id: str,
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    db = get_database()
    
    project = await db.projects.find_one({"_id": project_id, "user_id": current_user.id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
    content = await file.read()
    
    # 1. Validate & Parse Research PDF via PDFService
    try:
        pdf_info = PDFService.analyze_pdf_paper(content, file.filename)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
        
    paper_id = str(uuid.uuid4())
    title = pdf_info.get("title", file.filename)
    
    paper_db = PaperInDB(
        _id=paper_id,
        project_id=project_id,
        title=title,
        metadata={
            "authors": pdf_info.get("authors", []),
            "year": pdf_info.get("year", "Recent"),
            "venue": "Uploaded Publication (PDF)",
            "citationCount": 5,
            "abstract": pdf_info.get("abstract", "")
        },
        pdf_text=pdf_info.get("abstract", "") + "\n" + pdf_info.get("full_text", "")
    )
    
    paper_dict = paper_db.dict(by_alias=True)
    paper_dict["is_primary"] = True
    paper_dict["relevance_score"] = 1.0
    paper_dict["relevance_tier"] = "Primary Upload (★)"
    paper_dict["authors"] = pdf_info.get("authors", [])
    paper_dict["year"] = pdf_info.get("year", "Recent")
    paper_dict["venue"] = "Uploaded Publication (PDF)"
    paper_dict["abstract"] = pdf_info.get("abstract", "")
    
    await db.papers.insert_one(paper_dict)
    
    # 2. Check if project topic is missing or invalid -> Update with inferred topic
    current_topic = project.get("topic", "").strip()
    from services.ai_service import AIService
    valid_topic, _ = AIService.validate_input(current_topic)
    
    effective_topic = current_topic
    if not valid_topic or not current_topic:
        effective_topic = pdf_info.get("inferred_topic", title)
        await db.projects.update_one({"_id": project_id}, {"$set": {"topic": effective_topic, "name": effective_topic}})
        
    # 3. Fetch related external papers using effective_topic to build complete corpus
    try:
        from services.ai_service import AIService
        related_papers = await AIService.fetch_papers_for_topic(effective_topic, limit=8)
        for rp in related_papers:
            rp_db = {
                "_id": str(uuid.uuid4()),
                "project_id": project_id,
                "title": rp.get("title", "Related Work"),
                "authors": rp.get("authors", []),
                "year": rp.get("year"),
                "venue": rp.get("venue", "Scholarly Journal"),
                "doi_url": rp.get("url"),
                "citation_count": rp.get("citationCount", 0),
                "abstract": rp.get("abstract", ""),
                "relevance_score": rp.get("relevance_score", 0.5),
                "relevance_tier": rp.get("relevance_tier", "Relevant"),
                "is_primary": False,
                "metadata": rp,
                "pdf_text": rp.get("abstract", "")
            }
            await db.papers.insert_one(rp_db)
    except Exception as fetch_err:
        print(f"Related literature search notice: {fetch_err}")

    # Update paper count
    cursor = db.papers.find({"project_id": project_id})
    all_papers = await cursor.to_list(length=100)
    await db.projects.update_one({"_id": project_id}, {"$set": {"paper_count": len(all_papers)}})
    
    return PaperResponse(**paper_db.dict())

@router.get("/{project_id}/papers", response_model=List[PaperResponse])
async def get_project_papers(project_id: str, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    # Verification
    project = await db.projects.find_one({"_id": project_id, "user_id": current_user.id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    cursor = db.papers.find({"project_id": project_id})
    papers = await cursor.to_list(length=100)
    return [PaperResponse(**p) for p in papers]

@router.delete("/{project_id}/papers/{paper_id}")
async def delete_paper(project_id: str, paper_id: str, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    project = await db.projects.find_one({"_id": project_id, "user_id": current_user.id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    res = await db.papers.delete_one({"_id": paper_id, "project_id": project_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Paper not found")
        
    await db.projects.update_one({"_id": project_id}, {"$inc": {"paper_count": -1}})
    return {"message": "Paper deleted successfully"}

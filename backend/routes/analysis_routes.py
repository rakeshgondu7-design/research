from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models.user import UserResponse
from models.analysis import ResearchGap, ResearchOpportunity, AnalysisReport, PaperItem
from routes.auth_routes import get_current_user
from config.database import get_database
from services.ai_service import AIService
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter()

class SearchRequest(BaseModel):
    topic: str

@router.post("/search", response_model=AnalysisReport)
async def search_topic(request: SearchRequest, current_user: UserResponse = Depends(get_current_user)):
    # 1. Validate Input
    valid, msg = AIService.validate_input(request.topic)
    if not valid:
        raise HTTPException(status_code=400, detail=msg)

    db = get_database()
    project_id = str(uuid.uuid4())
    
    project_db = {
        "_id": project_id,
        "user_id": current_user.id,
        "name": request.topic,
        "description": f"Research analysis for {request.topic}",
        "topic": request.topic,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "paper_count": 0
    }
    await db.projects.insert_one(project_db)
    
    # 2. Retrieve & Filter Papers
    papers_data = await AIService.fetch_papers_for_topic(request.topic, limit=10)
    if not papers_data:
        raise HTTPException(status_code=400, detail="No sufficiently relevant research literature was found for this topic. Please refine the research topic or provide a paper/PDF.")
    
    papers = []
    for p in papers_data:
        paper_db = {
            "_id": str(uuid.uuid4()),
            "project_id": project_id,
            "title": p.get("title", "Unknown Title"),
            "authors": p.get("authors", []),
            "year": p.get("year"),
            "venue": p.get("venue", "Journal"),
            "doi_url": p.get("url"),
            "citation_count": p.get("citationCount", 0),
            "abstract": p.get("abstract", ""),
            "relevance_score": p.get("relevance_score", 0.5),
            "relevance_tier": p.get("relevance_tier", "Relevant"),
            "metadata": p,
            "pdf_text": p.get("abstract", "")
        }
        await db.papers.insert_one(paper_db)
        papers.append(paper_db)
        
    await db.projects.update_one({"_id": project_id}, {"$set": {"paper_count": len(papers)}})
    
    # 3. Analyze Literature
    report_data = await AIService.analyze_literature(papers)
    report_data["project_id"] = project_id
    report_data["_id"] = str(uuid.uuid4())
    await db.reports.insert_one(report_data)
    
    # 4. Detect Gaps & Opportunities
    gaps = await AIService.detect_research_gaps(request.topic, papers)
    for gap in gaps:
        gap["project_id"] = project_id
        await db.gaps.insert_one(gap)
        
        opportunities = await AIService.discover_opportunities(gap["_id"], gap["title"], gap.get("description", ""), gap.get("source_paper_citation", 0), gap.get("gap_type", ""))
        for opp in opportunities:
            opp["project_id"] = project_id
            await db.opportunities.insert_one(opp)
            
    return AnalysisReport(**report_data)

@router.post("/{project_id}/run", response_model=AnalysisReport)
async def run_analysis(project_id: str, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    project = await db.projects.find_one({"_id": project_id, "user_id": current_user.id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    topic = project.get("topic", "")
    valid, msg = AIService.validate_input(topic)
    if not valid:
        raise HTTPException(status_code=400, detail=msg)
        
    cursor = db.papers.find({"project_id": project_id})
    papers = await cursor.to_list(length=100)
    
    if not papers:
        papers_data = await AIService.fetch_papers_for_topic(topic, limit=10)
        if not papers_data:
            raise HTTPException(status_code=400, detail="Insufficient relevant literature found.")
        
        for p in papers_data:
            paper_db = {
                "_id": str(uuid.uuid4()),
                "project_id": project_id,
                "title": p.get("title", "Unknown Title"),
                "authors": p.get("authors", []),
                "year": p.get("year"),
                "venue": p.get("venue", "Journal"),
                "doi_url": p.get("url"),
                "citation_count": p.get("citationCount", 0),
                "abstract": p.get("abstract", ""),
                "relevance_score": p.get("relevance_score", 0.5),
                "relevance_tier": p.get("relevance_tier", "Relevant"),
                "metadata": p,
                "pdf_text": p.get("abstract", "")
            }
            await db.papers.insert_one(paper_db)
            papers.append(paper_db)
            
        await db.projects.update_one({"_id": project_id}, {"$set": {"paper_count": len(papers)}})
        
    report_data = await AIService.analyze_literature(papers)
    report_data["project_id"] = project_id
    report_data["_id"] = str(uuid.uuid4())
    await db.reports.insert_one(report_data)
    
    gaps = await AIService.detect_research_gaps(topic, papers)
    for gap in gaps:
        gap["project_id"] = project_id
        await db.gaps.insert_one(gap)
        
        opportunities = await AIService.discover_opportunities(gap["_id"], gap["title"], gap.get("description", ""), gap.get("source_paper_citation", 0), gap.get("gap_type", ""))
        for opp in opportunities:
            opp["project_id"] = project_id
            await db.opportunities.insert_one(opp)
            
    return AnalysisReport(**report_data)

@router.post("/{project_id}/step/literature")
async def step_literature(project_id: str, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    project = await db.projects.find_one({"_id": project_id, "user_id": current_user.id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    cursor = db.papers.find({"project_id": project_id})
    papers = await cursor.to_list(length=100)
    
    if not papers:
        topic = project.get("topic", "")
        valid, msg = AIService.validate_input(topic)
        if not valid:
            raise HTTPException(status_code=400, detail=msg)

        papers_data = await AIService.fetch_papers_for_topic(topic, limit=10)
        if not papers_data:
            raise HTTPException(status_code=400, detail="No sufficiently relevant research literature was found for this topic. Please refine the research topic or provide a paper/PDF.")
        
        for p in papers_data:
            paper_db = {
                "_id": str(uuid.uuid4()),
                "project_id": project_id,
                "title": p.get("title", "Unknown Title"),
                "authors": p.get("authors", []),
                "year": p.get("year"),
                "venue": p.get("venue", "Journal"),
                "doi_url": p.get("url"),
                "citation_count": p.get("citationCount", 0),
                "abstract": p.get("abstract", ""),
                "relevance_score": p.get("relevance_score", 0.5),
                "relevance_tier": p.get("relevance_tier", "Relevant"),
                "metadata": p,
                "pdf_text": p.get("abstract", "")
            }
            await db.papers.insert_one(paper_db)
            papers.append(paper_db)
            
        await db.projects.update_one({"_id": project_id}, {"$set": {"paper_count": len(papers)}})
    
    for p in papers:
        p["id"] = p["_id"]
    return papers

@router.get("/{project_id}/papers", response_model=List[PaperItem])
async def get_papers(project_id: str, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    cursor = db.papers.find({"project_id": project_id}).sort("relevance_score", -1)
    papers = await cursor.to_list(length=100)
    return [PaperItem(**p) for p in papers]

@router.post("/{project_id}/step/gaps")
async def step_gaps(project_id: str, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    project = await db.projects.find_one({"_id": project_id, "user_id": current_user.id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    cursor = db.papers.find({"project_id": project_id})
    papers = await cursor.to_list(length=100)
    
    await db.gaps.delete_many({"project_id": project_id})
    
    gaps = await AIService.detect_research_gaps(project.get("topic", "the given topic"), papers)
    for gap in gaps:
        gap["project_id"] = project_id
        await db.gaps.insert_one(gap)
        
    for g in gaps:
        g["id"] = g["_id"]
    return gaps

@router.post("/{project_id}/step/explanations")
async def step_explanations(project_id: str, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    cursor = db.gaps.find({"project_id": project_id})
    gaps = await cursor.to_list(length=100)
    for g in gaps:
        g["id"] = g["_id"]
    return gaps

@router.post("/{project_id}/step/opportunities")
async def step_opportunities(project_id: str, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    await db.opportunities.delete_many({"project_id": project_id})
    
    cursor = db.gaps.find({"project_id": project_id})
    gaps = await cursor.to_list(length=100)
    
    opportunities = []
    for gap in gaps:
        opps = await AIService.discover_opportunities(
            gap["_id"],
            gap["title"],
            gap.get("description", ""),
            gap.get("source_paper_citation", 0),
            gap.get("gap_type", ""),
            supporting_papers=gap.get("supporting_papers", [])
        )
        for opp in opps:
            opp["project_id"] = project_id
            await db.opportunities.insert_one(opp)
            opportunities.append(opp)
            
    for o in opportunities:
        o["id"] = o["_id"]
    return opportunities

@router.post("/{project_id}/step/feasibility")
async def step_feasibility(project_id: str, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    cursor = db.opportunities.find({"project_id": project_id})
    opps = await cursor.to_list(length=100)
    for o in opps:
        o["id"] = o["_id"]
    return opps

@router.post("/{project_id}/step/ranking")
async def step_ranking(project_id: str, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    project = await db.projects.find_one({"_id": project_id, "user_id": current_user.id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    cursor = db.opportunities.find({"project_id": project_id})
    opps = await cursor.to_list(length=100)
    
    papers_cursor = db.papers.find({"project_id": project_id})
    papers_metadata = await papers_cursor.to_list(length=100)
    
    primary_paper = next((p for p in papers_metadata if p.get("is_primary")), None)
    
    report_data = await AIService.analyze_literature(papers_metadata)
    report_data["project_id"] = project_id
    report_data["_id"] = str(uuid.uuid4())
    if primary_paper:
        report_data["primary_paper"] = {
            "title": primary_paper.get("title"),
            "authors": primary_paper.get("authors", []),
            "year": primary_paper.get("year"),
            "venue": primary_paper.get("venue")
        }
    
    await db.reports.delete_many({"project_id": project_id})
    await db.reports.insert_one(report_data)
    
    sorted_opps = sorted(opps, key=lambda x: x.get("rank_score", 0), reverse=True)
    for o in sorted_opps:
        o["id"] = o["_id"]
    return sorted_opps

@router.get("/{project_id}/report", response_model=AnalysisReport)
async def get_report(project_id: str, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    report = await db.reports.find_one({"project_id": project_id}, sort=[("generated_at", -1)])
    if not report:
        raise HTTPException(status_code=404, detail="Report not found. Please run analysis first.")
    return AnalysisReport(**report)

@router.get("/{project_id}/gaps", response_model=List[ResearchGap])
async def get_gaps(project_id: str, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    cursor = db.gaps.find({"project_id": project_id})
    gaps = await cursor.to_list(length=100)
    return [ResearchGap(**g) for g in gaps]

@router.get("/{project_id}/opportunities", response_model=List[ResearchOpportunity])
async def get_opportunities(project_id: str, current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    cursor = db.opportunities.find({"project_id": project_id}).sort("rank_score", -1)
    opportunities = await cursor.to_list(length=100)
    return [ResearchOpportunity(**o) for o in opportunities]

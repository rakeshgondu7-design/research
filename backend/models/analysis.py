from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class PaperItem(BaseModel):
    id: str = Field(alias="_id")
    project_id: str
    title: str
    authors: List[str] = []
    year: Optional[Any] = None
    venue: Optional[str] = None
    doi_url: Optional[str] = None
    citation_count: int = 0
    abstract: str = ""
    relevance_score: float = 0.0
    relevance_tier: str = "Relevant"
    is_primary: bool = False

class GapEvidence(BaseModel):
    paper_id: Optional[str]
    paper_title: str
    excerpt: str
    doi_url: Optional[str] = None

class ResearchGap(BaseModel):
    id: str = Field(alias="_id")
    project_id: str
    title: str
    description: str
    gap_type: str
    confidence_score: int
    evidence: List[GapEvidence] = []
    supporting_papers: List[dict] = []
    evidence_type: str = "Cross-Paper Evidence"
    why_it_exists: str
    previous_attempts: str
    why_unsolved: str
    potential_direction: str

class FeasibilityScore(BaseModel):
    dataset_availability: float # 1-10
    technical_complexity: float
    time_requirements: float
    infrastructure_requirements: float
    novelty_score: float
    resource_requirements: float # 1-10
    implementation_difficulty: float # 1-10
    practical_applicability: float # 1-10
    expected_impact: float # 1-10
    overall_score: float
    strengths: List[str]
    risks: List[str]
    supporting_papers: List[dict] = []

class ResearchOpportunity(BaseModel):
    id: str = Field(alias="_id")
    project_id: str
    gap_id: str
    title: str
    problem_addressed: str
    cross_domain_connection: str
    proposed_direction: str
    expected_benefit: str
    why_this_domain: str = ""
    why_this_technology: str = ""
    gap_solved: str = ""
    evidence_support: str = ""
    supporting_papers: List[dict] = []
    confidence_score: int
    feasibility: FeasibilityScore
    rank_score: float
    ranking_rationale: str

class AnalysisReport(BaseModel):
    project_id: str
    common_themes: List[str]
    research_methods: List[str]
    existing_limitations: List[str]
    future_work_areas: List[str]
    under_explored_areas: List[str]
    primary_paper: Optional[dict] = None
    generated_at: datetime = Field(default_factory=datetime.utcnow)

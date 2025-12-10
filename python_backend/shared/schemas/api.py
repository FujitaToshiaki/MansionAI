"""Pydantic schemas for API request/response validation."""

from datetime import datetime
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


# Base schemas
class BaseResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    error: str
    details: Optional[str] = None


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int


# Voting Results
class VotingResults(BaseModel):
    favor: int
    against: int
    abstain: int


# Condominium schemas
class CondominiumBase(BaseModel):
    name: str
    address: str
    units: int
    build_year: int
    management_start_date: datetime
    current_regulation_version: Optional[str] = "1.0"
    law_revision_status: str = "pending"
    assigned_manager: Optional[str] = None


class CondominiumCreate(CondominiumBase):
    pass


class CondominiumResponse(CondominiumBase):
    id: str
    last_activity: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CondominiumListResponse(BaseModel):
    condominiums: List[CondominiumResponse]


# Document schemas
class DocumentBase(BaseModel):
    title: str
    type: str  # minutes, regulation, decision, report
    file_path: Optional[str] = None
    original_file_name: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    meeting_date: Optional[datetime] = None
    page_count: int = 1


class DocumentCreate(DocumentBase):
    condominium_id: str


class DocumentResponse(DocumentBase):
    id: str
    condominium_id: str
    ocr_status: str = "pending"
    ocr_accuracy: Optional[int] = None
    ocr_text: Optional[str] = None
    uploaded_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]


# OCR schemas
class LowConfidenceRegion(BaseModel):
    text: str
    confidence: float
    coordinates: dict  # {x, y, width, height}


class OCRResult(BaseModel):
    text: str
    accuracy: float
    low_confidence_regions: List[LowConfidenceRegion] = []


class OCRPageResult(BaseModel):
    page_number: int
    text: str
    accuracy: float
    low_confidence_regions: List[LowConfidenceRegion] = []


class OCRProcessRequest(BaseModel):
    pass  # Files are sent as multipart form data


class OCRProcessResponse(BaseModel):
    success: bool
    results: List[OCRPageResult]


class OCRUploadRequest(BaseModel):
    condominium_id: str
    title: str
    meeting_date: str
    ocr_results: str  # JSON string of OCR results


# Decision schemas
class DecisionBase(BaseModel):
    title: str
    description: Optional[str] = None
    result: str  # approved, rejected, deferred
    voting_results: Optional[VotingResults] = None
    related_regulation_article: Optional[str] = None
    category: str
    meeting_date: datetime


class DecisionResponse(DecisionBase):
    id: str
    condominium_id: str
    document_id: Optional[str] = None
    is_auto_extracted: bool = False
    confidence: Optional[int] = None
    created_at: Optional[datetime] = None
    # Additional fields for RAG-extracted decisions
    meeting_type: Optional[str] = None
    agenda: Optional[str] = None
    decision: Optional[str] = None
    related_article: Optional[str] = None

    class Config:
        from_attributes = True


class DecisionListResponse(BaseModel):
    decisions: List[DecisionResponse]


# Regulation schemas
class RegulationBase(BaseModel):
    version: str
    article: str
    title: str
    content: str
    revision_reason: Optional[str] = None
    effective_date: Optional[datetime] = None
    is_active: bool = True
    ai_generated_suggestion: Optional[str] = None
    approval_status: str = "draft"


class RegulationResponse(RegulationBase):
    id: str
    condominium_id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RegulationRevisionBase(BaseModel):
    category: str
    title: str
    change_description: str
    before_text: Optional[str] = None
    after_text: Optional[str] = None
    article_number: Optional[str] = None
    reference_section: Optional[str] = None
    change_type: str
    priority: str = "medium"
    status: str = "pending"


class RegulationRevisionResponse(RegulationRevisionBase):
    id: str
    revision_header_id: Optional[str] = None
    assigned_to: Optional[str] = None
    reviewed_by: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # Additional fields for detailed view
    current_text: Optional[str] = None
    proposed_text: Optional[str] = None
    reason: Optional[str] = None
    impact: Optional[str] = None

    class Config:
        from_attributes = True


class RevisionHeaderBase(BaseModel):
    year: int
    title: str
    description: Optional[str] = None
    status: str = "planning"
    total_items: int = 0
    completed_items: int = 0
    revision_type: str = "law_compliance"
    priority_level: str = "medium"
    assigned_manager: Optional[str] = None


class RevisionHeaderResponse(RevisionHeaderBase):
    id: str
    start_date: Optional[datetime] = None
    target_completion_date: Optional[datetime] = None
    actual_completion_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    revisions: Optional[List[RegulationRevisionResponse]] = None
    # Additional computed fields
    actual_total_items: Optional[int] = None
    actual_completed_items: Optional[int] = None
    assignee: Optional[str] = None

    class Config:
        from_attributes = True


# Knowledge schemas
class KnowledgeDocumentBase(BaseModel):
    title: str
    type: str  # current_regulation, meeting_minutes, standard_regulation, decision_history
    content: str
    metadata: Optional[dict] = None
    original_file_name: Optional[str] = None


class KnowledgeDocumentCreate(KnowledgeDocumentBase):
    condominium_id: str


class KnowledgeDocumentResponse(KnowledgeDocumentBase):
    id: str
    condominium_id: str
    uploaded_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    chunk_count: Optional[int] = None

    class Config:
        from_attributes = True


class KnowledgeChunkResponse(BaseModel):
    id: str
    document_id: str
    chunk_index: int
    content: str
    embedding: Optional[str] = None
    metadata: Optional[dict] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class KnowledgeSearchRequest(BaseModel):
    query: str
    type: Optional[str] = None


class KnowledgeSearchResponse(BaseModel):
    chunks: List[KnowledgeChunkResponse]
    documents: List[KnowledgeDocumentResponse]


# Analysis schemas
class AnalysisResultResponse(BaseModel):
    id: str
    condominium_id: str
    task_id: Optional[str] = None
    priority: str
    article: str
    title: str
    reason: str
    current_text: Optional[str] = None
    proposed_text: Optional[str] = None
    legal_basis: Optional[str] = None
    standard_regulation_ref: Optional[str] = None
    related_decision_id: Optional[str] = None
    law_revision_required: bool = False
    impact: str
    implementation_notes: Optional[str] = None
    data_sources: Optional[dict] = None
    change_history: Optional[dict] = None
    status: str = "draft"
    revision_year: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AnalysisListResponse(BaseModel):
    total_issues: int = Field(alias="totalIssues")
    issues: List[AnalysisResultResponse]

    class Config:
        populate_by_name = True


class AnalysisStartRequest(BaseModel):
    settings: Optional[dict] = None


class AnalysisStartResponse(BaseModel):
    task_id: str = Field(alias="taskId")
    message: str

    class Config:
        populate_by_name = True


# Activity schemas
class ActivityResponse(BaseModel):
    id: str
    condominium_id: str
    type: str
    description: str
    status: str
    user_id: Optional[str] = None
    metadata: Optional[dict] = None
    created_at: Optional[datetime] = None
    time_ago: Optional[str] = None

    class Config:
        from_attributes = True


# Dashboard schemas
class DashboardStatsResponse(BaseModel):
    total_condominiums: int = Field(alias="totalCondominiums")
    pending_revisions: int = Field(alias="pendingRevisions")
    completed_this_month: int = Field(alias="completedThisMonth")
    ai_tasks_running: int = Field(alias="aiTasksRunning")

    class Config:
        populate_by_name = True


# Meeting Minutes schemas
class MeetingMinuteBase(BaseModel):
    title: str
    date: str
    meeting_type: str
    content: Optional[str] = None
    summary: Optional[str] = None


class MeetingMinuteResponse(MeetingMinuteBase):
    id: str
    status: str = "completed"
    attendees: Optional[int] = None
    total_units: Optional[int] = None
    attendance_rate: Optional[float] = None
    source_document: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MeetingMinuteDetailResponse(MeetingMinuteResponse):
    time: Optional[str] = None
    location: Optional[str] = None
    chairman: Optional[str] = None
    secretary: Optional[str] = None
    quorum: bool = True
    agenda: Optional[List[dict]] = None
    decisions: Optional[List[dict]] = None
    next_meeting: Optional[str] = None
    attachments: Optional[List[str]] = None
    raw_content: Optional[str] = None

    class Config:
        from_attributes = True

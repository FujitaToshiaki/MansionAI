"""SQLAlchemy models matching the existing Drizzle ORM schema."""

import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(Text, nullable=False, unique=True)
    password = Column(Text, nullable=False)
    role = Column(Text, nullable=False, default="manager")
    created_at = Column(DateTime, default=func.now())


class Condominium(Base):
    __tablename__ = "condominiums"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(Text, nullable=False)
    address = Column(Text, nullable=False)
    units = Column(Integer, nullable=False)
    build_year = Column(Integer, nullable=False)
    management_start_date = Column(DateTime, nullable=False)
    current_regulation_version = Column(Text, default="1.0")
    law_revision_status = Column(Text, nullable=False, default="pending")
    last_activity = Column(DateTime, default=func.now())
    assigned_manager = Column(Text)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    documents = relationship("Document", back_populates="condominium")
    decisions = relationship("Decision", back_populates="condominium")
    regulations = relationship("Regulation", back_populates="condominium")
    activities = relationship("Activity", back_populates="condominium")
    knowledge_documents = relationship("KnowledgeDocument", back_populates="condominium")
    ai_tasks = relationship("AiTask", back_populates="condominium")
    analysis_results = relationship("RegulationAnalysisResult", back_populates="condominium")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    condominium_id = Column(String, ForeignKey("condominiums.id"), nullable=False)
    title = Column(Text, nullable=False)
    type = Column(Text, nullable=False)  # minutes, regulation, decision, report
    file_path = Column(Text)
    original_file_name = Column(Text)
    file_size = Column(Integer)
    mime_type = Column(Text)
    ocr_status = Column(Text, default="pending")  # pending, processing, completed, failed
    ocr_accuracy = Column(Integer)
    ocr_text = Column(Text)
    meeting_date = Column(DateTime)
    page_count = Column(Integer, default=1)
    uploaded_at = Column(DateTime, default=func.now())
    processed_at = Column(DateTime)

    # Relationships
    condominium = relationship("Condominium", back_populates="documents")
    pages = relationship("DocumentPage", back_populates="document")
    decisions = relationship("Decision", back_populates="document")


class DocumentPage(Base):
    __tablename__ = "document_pages"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    image_path = Column(Text, nullable=False)
    ocr_text = Column(Text)
    ocr_accuracy = Column(Integer)
    low_confidence_regions = Column(JSONB)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    document = relationship("Document", back_populates="pages")


class Decision(Base):
    __tablename__ = "decisions"

    id = Column(String, primary_key=True, default=generate_uuid)
    condominium_id = Column(String, ForeignKey("condominiums.id"), nullable=False)
    document_id = Column(String, ForeignKey("documents.id"))
    title = Column(Text, nullable=False)
    description = Column(Text)
    result = Column(Text, nullable=False)  # approved, rejected, deferred
    voting_results = Column(JSONB)  # {favor: number, against: number, abstain: number}
    related_regulation_article = Column(Text)
    category = Column(Text, nullable=False)
    meeting_date = Column(DateTime, nullable=False)
    is_auto_extracted = Column(Boolean, default=False)
    confidence = Column(Integer)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    condominium = relationship("Condominium", back_populates="decisions")
    document = relationship("Document", back_populates="decisions")


class Regulation(Base):
    __tablename__ = "regulations"

    id = Column(String, primary_key=True, default=generate_uuid)
    condominium_id = Column(String, ForeignKey("condominiums.id"), nullable=False)
    version = Column(Text, nullable=False)
    article = Column(Text, nullable=False)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    revision_reason = Column(Text)
    effective_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    ai_generated_suggestion = Column(Text)
    approval_status = Column(Text, default="draft")
    created_at = Column(DateTime, default=func.now())

    # Relationships
    condominium = relationship("Condominium", back_populates="regulations")


class RevisionHeader(Base):
    __tablename__ = "revision_headers"

    id = Column(String, primary_key=True, default=generate_uuid)
    year = Column(Integer, nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text)
    status = Column(Text, nullable=False, default="planning")
    total_items = Column(Integer, default=0)
    completed_items = Column(Integer, default=0)
    start_date = Column(DateTime)
    target_completion_date = Column(DateTime)
    actual_completion_date = Column(DateTime)
    revision_type = Column(Text, nullable=False, default="law_compliance")
    priority_level = Column(Text, nullable=False, default="medium")
    assigned_manager = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now())

    # Relationships
    revisions = relationship("RegulationRevision", back_populates="header")


class RegulationRevision(Base):
    __tablename__ = "regulation_revisions"

    id = Column(String, primary_key=True, default=generate_uuid)
    revision_header_id = Column(String, ForeignKey("revision_headers.id"))
    category = Column(Text, nullable=False)
    title = Column(Text, nullable=False)
    change_description = Column(Text, nullable=False)
    before_text = Column(Text)
    after_text = Column(Text)
    article_number = Column(Text)
    reference_section = Column(Text)
    change_type = Column(Text, nullable=False)
    priority = Column(Text, default="medium")
    status = Column(Text, default="pending")
    assigned_to = Column(Text)
    reviewed_by = Column(Text)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now())

    # Relationships
    header = relationship("RevisionHeader", back_populates="revisions")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True, default=generate_uuid)
    condominium_id = Column(String, ForeignKey("condominiums.id"), nullable=False)
    type = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Text, nullable=False)
    user_id = Column(String, ForeignKey("users.id"))
    activity_metadata = Column("metadata", JSONB)  # Renamed to avoid SQLAlchemy reserved name
    created_at = Column(DateTime, default=func.now())

    # Relationships
    condominium = relationship("Condominium", back_populates="activities")


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    condominium_id = Column(String, ForeignKey("condominiums.id"), nullable=False)
    title = Column(Text, nullable=False)
    type = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    doc_metadata = Column("metadata", JSONB)  # Renamed to avoid SQLAlchemy reserved name
    original_file_name = Column(Text)
    uploaded_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now())

    # Relationships
    condominium = relationship("Condominium", back_populates="knowledge_documents")
    chunks = relationship("KnowledgeChunk", back_populates="document")


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("knowledge_documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Text)
    chunk_metadata = Column("metadata", JSONB)  # Renamed to avoid SQLAlchemy reserved name
    created_at = Column(DateTime, default=func.now())

    # Relationships
    document = relationship("KnowledgeDocument", back_populates="chunks")


class AiSearchHistory(Base):
    __tablename__ = "ai_search_history"

    id = Column(String, primary_key=True, default=generate_uuid)
    condominium_id = Column(String, ForeignKey("condominiums.id"), nullable=False)
    query = Column(Text, nullable=False)
    results = Column(JSONB)
    context = Column(Text)
    user_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())


class AiTask(Base):
    __tablename__ = "ai_tasks"

    id = Column(String, primary_key=True, default=generate_uuid)
    task_id = Column(Text, unique=True, nullable=False)
    task_type = Column(Text, nullable=False)
    agent_type = Column(Text, nullable=False)
    condominium_id = Column(String, ForeignKey("condominiums.id"))
    status = Column(Text, nullable=False, default="queued")
    progress = Column(Integer, default=0)
    current_step = Column(Text)
    settings = Column(JSONB)
    result = Column(JSONB)
    error_message = Column(Text)
    estimated_duration = Column(Integer)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    condominium = relationship("Condominium", back_populates="ai_tasks")


class RegulationAnalysisResult(Base):
    __tablename__ = "regulation_analysis_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    condominium_id = Column(String, ForeignKey("condominiums.id"), nullable=False)
    task_id = Column(String, ForeignKey("ai_tasks.id"))
    priority = Column(Text, nullable=False)
    article = Column(Text, nullable=False)
    title = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    current_text = Column(Text)
    proposed_text = Column(Text)
    legal_basis = Column(Text)
    standard_regulation_ref = Column(Text)
    related_decision_id = Column(String, ForeignKey("decisions.id"))
    law_revision_required = Column(Boolean, default=False)
    impact = Column(Text, nullable=False)
    implementation_notes = Column(Text)
    data_sources = Column(JSONB)
    change_history = Column(JSONB)
    status = Column(Text, default="draft")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now())

    # Relationships
    condominium = relationship("Condominium", back_populates="analysis_results")

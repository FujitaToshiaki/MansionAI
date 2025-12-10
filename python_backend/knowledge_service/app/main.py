"""Knowledge/RAG Service - Main entry point."""

import os
import sys
from contextlib import asynccontextmanager
from typing import List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Add shared module to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from shared.utils.database import get_db, init_db
from shared.utils.config import get_settings
from shared.models.database import KnowledgeDocument, KnowledgeChunk, AiSearchHistory

from .chunking import DocumentChunker
from .search import KnowledgeSearcher
from .extractors import DecisionExtractor, MinutesExtractor

# Initialize services
chunker = None
searcher = None
decision_extractor = None
minutes_extractor = None
settings = get_settings()


class DocumentUploadRequest(BaseModel):
    condominium_id: str
    title: str
    type: str
    content: str
    original_file_name: Optional[str] = None
    metadata: Optional[dict] = None


class SearchRequest(BaseModel):
    condominium_id: str
    query: str
    type: Optional[str] = None
    limit: int = 10


class ChunkResponse(BaseModel):
    id: str
    document_id: str
    chunk_index: int
    content: str
    metadata: Optional[dict] = None


class DocumentResponse(BaseModel):
    id: str
    title: str
    type: str
    content: Optional[str] = None
    chunk_count: int = 0


class SearchResponse(BaseModel):
    chunks: List[ChunkResponse]
    documents: List[DocumentResponse]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    global chunker, searcher, decision_extractor, minutes_extractor
    
    # Startup
    print("Knowledge Service starting up...")
    
    # Initialize database
    try:
        init_db()
        print("Database initialized")
    except Exception as e:
        print(f"Database initialization warning: {e}")
    
    # Initialize services
    chunker = DocumentChunker(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap
    )
    searcher = KnowledgeSearcher()
    decision_extractor = DecisionExtractor()
    minutes_extractor = MinutesExtractor()
    
    print("Knowledge services initialized")
    
    yield
    
    # Shutdown
    print("Knowledge Service shutting down...")


app = FastAPI(
    title="MansionAI Knowledge Service",
    description="Knowledge/RAG Service for document management and semantic search",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "MansionAI Knowledge Service", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "chunk_size": settings.chunk_size,
        "chunk_overlap": settings.chunk_overlap
    }


@app.post("/upload")
async def upload_document(
    request: DocumentUploadRequest,
    db: Session = Depends(get_db)
):
    """Upload and process a knowledge document."""
    try:
        # Create document
        document = KnowledgeDocument(
            id=str(uuid4()),
            condominium_id=request.condominium_id,
            title=request.title,
            type=request.type,
            content=request.content,
            original_file_name=request.original_file_name,
            doc_metadata=request.metadata or {},
        )
        db.add(document)
        db.flush()
        
        # Process into chunks
        chunks = chunker.chunk_document(request.content)
        
        for i, chunk_content in enumerate(chunks):
            chunk = KnowledgeChunk(
                id=str(uuid4()),
                document_id=document.id,
                chunk_index=i,
                content=chunk_content,
                chunk_metadata={
                    "document_title": request.title,
                    "document_type": request.type,
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                }
            )
            db.add(chunk)
        
        db.commit()
        
        return {
            "id": document.id,
            "title": document.title,
            "type": document.type,
            "chunk_count": len(chunks),
            "message": f"Document uploaded and processed into {len(chunks)} chunks"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")


@app.post("/add")
async def add_document(
    condominium_id: str = Body(...),
    title: str = Body(...),
    content: str = Body(...),
    type: str = Body(...),
    metadata: Optional[dict] = Body(None),
    db: Session = Depends(get_db)
):
    """Add a document to the knowledge base (alternative endpoint)."""
    request = DocumentUploadRequest(
        condominium_id=condominium_id,
        title=title,
        type=type,
        content=content,
        metadata=metadata
    )
    return await upload_document(request, db)


@app.get("/documents/{condominium_id}")
async def get_documents(condominium_id: str, db: Session = Depends(get_db)):
    """Get all documents for a condominium."""
    try:
        documents = db.query(KnowledgeDocument).filter(
            KnowledgeDocument.condominium_id == condominium_id
        ).all()
        
        result = []
        for doc in documents:
            chunk_count = db.query(KnowledgeChunk).filter(
                KnowledgeChunk.document_id == doc.id
            ).count()
            
            result.append({
                "id": doc.id,
                "title": doc.title,
                "type": doc.type,
                "content": doc.content[:200] + "..." if len(doc.content) > 200 else doc.content,
                "metadata": doc.doc_metadata,
                "uploadedAt": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
                "chunkCount": chunk_count
            })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get documents: {str(e)}")


@app.get("/documents/{condominium_id}/{doc_type}")
async def get_documents_by_type(
    condominium_id: str,
    doc_type: str,
    db: Session = Depends(get_db)
):
    """Get documents by type for a condominium."""
    try:
        documents = db.query(KnowledgeDocument).filter(
            KnowledgeDocument.condominium_id == condominium_id,
            KnowledgeDocument.type == doc_type
        ).all()
        
        return [
            {
                "id": doc.id,
                "title": doc.title,
                "type": doc.type,
                "content": doc.content[:200] + "..." if len(doc.content) > 200 else doc.content,
                "metadata": doc.doc_metadata
            }
            for doc in documents
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get documents: {str(e)}")


@app.delete("/documents/{document_id}")
async def delete_document(document_id: str, db: Session = Depends(get_db)):
    """Delete a document and its chunks."""
    try:
        # Delete chunks first
        db.query(KnowledgeChunk).filter(
            KnowledgeChunk.document_id == document_id
        ).delete()
        
        # Delete document
        db.query(KnowledgeDocument).filter(
            KnowledgeDocument.id == document_id
        ).delete()
        
        db.commit()
        return {"message": "Document deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")


@app.post("/search", response_model=SearchResponse)
async def search_knowledge(request: SearchRequest, db: Session = Depends(get_db)):
    """Search the knowledge base."""
    try:
        # Record search history
        history = AiSearchHistory(
            id=str(uuid4()),
            condominium_id=request.condominium_id,
            query=request.query,
            search_type=request.type or "all",
            results_count=0
        )
        db.add(history)
        
        # Search chunks
        chunk_query = db.query(KnowledgeChunk).join(KnowledgeDocument).filter(
            KnowledgeDocument.condominium_id == request.condominium_id,
            KnowledgeChunk.content.ilike(f"%{request.query}%")
        )
        
        if request.type:
            chunk_query = chunk_query.filter(KnowledgeDocument.type == request.type)
        
        chunks = chunk_query.limit(request.limit).all()
        
        # Search documents
        doc_query = db.query(KnowledgeDocument).filter(
            KnowledgeDocument.condominium_id == request.condominium_id,
            KnowledgeDocument.content.ilike(f"%{request.query}%")
        )
        
        if request.type:
            doc_query = doc_query.filter(KnowledgeDocument.type == request.type)
        
        documents = doc_query.limit(5).all()
        
        # Update history
        history.results_count = len(chunks) + len(documents)
        db.commit()
        
        return SearchResponse(
            chunks=[
                ChunkResponse(
                    id=c.id,
                    document_id=c.document_id,
                    chunk_index=c.chunk_index,
                    content=c.content,
                    metadata=c.chunk_metadata
                )
                for c in chunks
            ],
            documents=[
                DocumentResponse(
                    id=d.id,
                    title=d.title,
                    type=d.type,
                    content=d.content[:500] + "..." if len(d.content) > 500 else d.content,
                    chunk_count=db.query(KnowledgeChunk).filter(
                        KnowledgeChunk.document_id == d.id
                    ).count()
                )
                for d in documents
            ]
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/search-history/{condominium_id}")
async def get_search_history(condominium_id: str, db: Session = Depends(get_db)):
    """Get search history for a condominium."""
    try:
        history = db.query(AiSearchHistory).filter(
            AiSearchHistory.condominium_id == condominium_id
        ).order_by(AiSearchHistory.created_at.desc()).limit(50).all()
        
        return [
            {
                "id": h.id,
                "query": h.query,
                "searchType": h.search_type,
                "resultsCount": h.results_count,
                "createdAt": h.created_at.isoformat() if h.created_at else None
            }
            for h in history
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get search history: {str(e)}")


@app.get("/decisions/{condominium_id}")
async def get_decisions(condominium_id: str, db: Session = Depends(get_db)):
    """Extract decisions from knowledge documents."""
    try:
        # Get meeting minutes documents
        documents = db.query(KnowledgeDocument).filter(
            KnowledgeDocument.condominium_id == condominium_id,
            KnowledgeDocument.type.in_(["meeting_minutes", "decision_history"])
        ).all()
        
        all_decisions = []
        for doc in documents:
            decisions = decision_extractor.extract_decisions(doc.content)
            all_decisions.extend(decisions)
        
        return all_decisions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract decisions: {str(e)}")


@app.get("/minutes/{condominium_id}")
async def get_minutes(condominium_id: str, db: Session = Depends(get_db)):
    """Get meeting minutes for a condominium."""
    try:
        documents = db.query(KnowledgeDocument).filter(
            KnowledgeDocument.condominium_id == condominium_id,
            KnowledgeDocument.type == "meeting_minutes"
        ).all()
        
        all_minutes = []
        for doc in documents:
            minutes = minutes_extractor.extract_minutes(doc.content)
            for minute in minutes:
                minute["documentId"] = doc.id
                minute["documentTitle"] = doc.title
            all_minutes.extend(minutes)
        
        return all_minutes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get minutes: {str(e)}")


@app.get("/minutes/{condominium_id}/{minute_id}")
async def get_minute_detail(
    condominium_id: str,
    minute_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed meeting minute."""
    try:
        # Find the document containing this minute
        documents = db.query(KnowledgeDocument).filter(
            KnowledgeDocument.condominium_id == condominium_id,
            KnowledgeDocument.type == "meeting_minutes"
        ).all()
        
        for doc in documents:
            minutes = minutes_extractor.extract_minutes(doc.content)
            for minute in minutes:
                if minute.get("id") == minute_id:
                    minute["documentId"] = doc.id
                    minute["documentTitle"] = doc.title
                    minute["fullContent"] = doc.content
                    return minute
        
        raise HTTPException(status_code=404, detail="Meeting minute not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get minute detail: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", "8002"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )

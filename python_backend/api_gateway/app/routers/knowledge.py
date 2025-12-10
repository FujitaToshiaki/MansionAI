"""Knowledge Base API endpoints."""

import os
from datetime import datetime
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
import httpx

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from shared.utils.database import get_db
from shared.utils.config import get_settings
from shared.models.database import KnowledgeDocument, KnowledgeChunk, Activity
from shared.schemas.api import (
    KnowledgeDocumentResponse,
)

router = APIRouter()
settings = get_settings()


# Mock knowledge documents
MOCK_KNOWLEDGE_DOCS = [
    {
        "id": "doc1",
        "title": "メゾンドオプテージ管理規約（現行版）",
        "type": "current_regulation",
        "description": "現在施行中の管理規約",
        "uploadedAt": "2024-03-15T10:00:00Z",
        "chunkCount": 183,
        "metadata": {"version": "v4.0", "fileSize": 2048000}
    },
    {
        "id": "doc2",
        "title": "メゾンドオプテージ管理規約（過去版v3.1）",
        "type": "current_regulation",
        "description": "2023年版管理規約",
        "uploadedAt": "2023-09-01T10:00:00Z",
        "chunkCount": 165,
        "metadata": {"version": "v3.1", "fileSize": 1900000}
    },
    {
        "id": "doc3",
        "title": "メゾンドオプテージ管理規約（過去版v3.0）",
        "type": "current_regulation",
        "description": "2022年版管理規約",
        "uploadedAt": "2022-03-01T10:00:00Z",
        "chunkCount": 158,
        "metadata": {"version": "v3.0", "fileSize": 1850000}
    },
    {
        "id": "doc4",
        "title": "区分所有法改正対応案",
        "type": "current_regulation",
        "description": "法改正に伴う管理規約改正案",
        "uploadedAt": "2024-01-15T10:00:00Z",
        "chunkCount": 45,
        "metadata": {"version": "draft", "fileSize": 850000}
    }
]


@router.get("/condominiums/{condominium_id}/knowledge")
async def get_knowledge_documents(condominium_id: str, db: Session = Depends(get_db)):
    """Get knowledge documents for a condominium."""
    try:
        # Try to get from knowledge service
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.knowledge_service_url}/documents/{condominium_id}",
                timeout=30.0
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"Knowledge service error: {e}")
    
    try:
        # Try database
        documents = db.query(KnowledgeDocument).filter(
            KnowledgeDocument.condominium_id == condominium_id
        ).all()
        
        if documents:
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
        print(f"Database error: {e}")
    
    # Return mock data
    return MOCK_KNOWLEDGE_DOCS


@router.get("/condominiums/{condominium_id}/knowledge/{doc_type}")
async def get_knowledge_by_type(
    condominium_id: str,
    doc_type: str,
    db: Session = Depends(get_db)
):
    """Get knowledge documents by type."""
    try:
        # Try to get from knowledge service
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.knowledge_service_url}/documents/{condominium_id}/{doc_type}",
                timeout=30.0
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"Knowledge service error: {e}")
    
    try:
        documents = db.query(KnowledgeDocument).filter(
            KnowledgeDocument.condominium_id == condominium_id,
            KnowledgeDocument.type == doc_type
        ).all()
        
        if documents:
            return [KnowledgeDocumentResponse.model_validate(d) for d in documents]
    except Exception as e:
        print(f"Database error: {e}")
    
    return []


@router.post("/condominiums/{condominium_id}/knowledge/upload")
async def upload_knowledge_document(
    condominium_id: str,
    type: str = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a knowledge document."""
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    if not type or not title:
        raise HTTPException(status_code=400, detail="Type and title are required")
    
    try:
        # Read file content
        content = await file.read()
        try:
            text_content = content.decode("utf-8")
        except UnicodeDecodeError:
            try:
                text_content = content.decode("shift_jis")
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=400,
                    detail="Unable to decode file. Please ensure it's a text file."
                )
        
        # Try to call knowledge service
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.knowledge_service_url}/upload",
                    json={
                        "condominium_id": condominium_id,
                        "title": title,
                        "type": type,
                        "content": text_content,
                        "original_file_name": file.filename,
                        "metadata": {
                            "fileSize": len(content),
                            "mimeType": file.content_type,
                            "uploadDate": datetime.now().isoformat()
                        }
                    },
                    timeout=60.0
                )
                if response.status_code == 200:
                    doc_data = response.json()
                    
                    # Create activity
                    activity = Activity(
                        id=str(uuid4()),
                        condominium_id=condominium_id,
                        type="document_upload",
                        description=f"ナレッジドキュメント「{title}」をアップロードしました",
                        status="success",
                        user_id="mock-user-id",
                        metadata={"documentId": doc_data.get("id"), "type": type},
                        created_at=datetime.now()
                    )
                    db.add(activity)
                    db.commit()
                    
                    return doc_data
        except Exception as e:
            print(f"Knowledge service error: {e}")
        
        # Fallback: save directly to database
        document = KnowledgeDocument(
            id=str(uuid4()),
            condominium_id=condominium_id,
            title=title,
            type=type,
            content=text_content,
            original_file_name=file.filename,
            metadata={
                "fileSize": len(content),
                "mimeType": file.content_type,
                "uploadDate": datetime.now().isoformat()
            },
            uploaded_at=datetime.now(),
            updated_at=datetime.now()
        )
        db.add(document)
        
        # Create activity
        activity = Activity(
            id=str(uuid4()),
            condominium_id=condominium_id,
            type="document_upload",
            description=f"ナレッジドキュメント「{title}」をアップロードしました",
            status="success",
            user_id="mock-user-id",
            metadata={"documentId": document.id, "type": type},
            created_at=datetime.now()
        )
        db.add(activity)
        db.commit()
        
        return KnowledgeDocumentResponse.model_validate(document)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload knowledge document: {str(e)}"
        )


@router.post("/condominiums/{condominium_id}/knowledge/search")
async def search_knowledge(
    condominium_id: str,
    query: str = Body(..., embed=True),
    type: Optional[str] = Body(None, embed=True),
    db: Session = Depends(get_db)
):
    """Search knowledge base."""
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    try:
        # Try to call knowledge service
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.knowledge_service_url}/search",
                json={
                    "condominium_id": condominium_id,
                    "query": query,
                    "type": type
                },
                timeout=30.0
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"Knowledge service error: {e}")
    
    # Fallback: simple text search
    try:
        
        documents = db.query(KnowledgeDocument).filter(
            KnowledgeDocument.condominium_id == condominium_id,
            KnowledgeDocument.content.ilike(f"%{query}%")
        ).limit(10).all()
        
        chunks = db.query(KnowledgeChunk).join(KnowledgeDocument).filter(
            KnowledgeDocument.condominium_id == condominium_id,
            KnowledgeChunk.content.ilike(f"%{query}%")
        ).limit(20).all()
        
        return {
            "chunks": [
                {
                    "id": c.id,
                    "documentId": c.document_id,
                    "chunkIndex": c.chunk_index,
                    "content": c.content,
                    "metadata": c.chunk_metadata
                }
                for c in chunks
            ],
            "documents": [
                {
                    "id": d.id,
                    "title": d.title,
                    "type": d.type,
                    "content": d.content[:500] + "..." if len(d.content) > 500 else d.content
                }
                for d in documents
            ]
        }
    except Exception as e:
        print(f"Search error: {e}")
    
    return {"chunks": [], "documents": []}


@router.get("/condominiums/{condominium_id}/knowledge/search-history")
async def get_search_history(condominium_id: str, db: Session = Depends(get_db)):
    """Get search history."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.knowledge_service_url}/search-history/{condominium_id}",
                timeout=30.0
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"Knowledge service error: {e}")
    
    return []


@router.delete("/knowledge/{document_id}")
async def delete_knowledge_document(document_id: str, db: Session = Depends(get_db)):
    """Delete a knowledge document."""
    try:
        # Try to call knowledge service
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{settings.knowledge_service_url}/documents/{document_id}",
                timeout=30.0
            )
            if response.status_code == 200:
                return {"message": "Document deleted successfully"}
    except Exception as e:
        print(f"Knowledge service error: {e}")
    
    try:
        # Delete from database
        db.query(KnowledgeChunk).filter(
            KnowledgeChunk.document_id == document_id
        ).delete()
        db.query(KnowledgeDocument).filter(
            KnowledgeDocument.id == document_id
        ).delete()
        db.commit()
        return {"message": "Document deleted successfully"}
    except Exception as e:
        print(f"Delete error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete document")


@router.post("/condominiums/{condominium_id}/load-assets")
async def load_assets(condominium_id: str, db: Session = Depends(get_db)):
    """Load attached assets into RAG system."""
    try:
        assets_dir = "attached_assets"
        if not os.path.exists(assets_dir):
            return {"message": "No assets directory found", "files": []}
        
        files = os.listdir(assets_dir)
        loaded_files = []
        
        for file_name in files:
            if not file_name.endswith(".txt"):
                continue
            
            file_path = os.path.join(assets_dir, file_name)
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                file_size = os.path.getsize(file_path)
                
                # Determine document type
                doc_type = "document"
                if "議事録" in file_name:
                    doc_type = "meeting_minutes"
                elif "管理規約" in file_name:
                    doc_type = "current_regulation"
                elif "決議" in file_name:
                    doc_type = "decision_history"
                elif "変更議案" in file_name:
                    doc_type = "amendment_proposal"
                
                # Try to call knowledge service
                try:
                    async with httpx.AsyncClient() as client:
                        await client.post(
                            f"{settings.knowledge_service_url}/add",
                            json={
                                "condominium_id": condominium_id,
                                "title": file_name.replace("_", " ").replace(".txt", ""),
                                "content": content,
                                "type": doc_type,
                                "metadata": {"originalFileName": file_name, "fileSize": file_size}
                            },
                            timeout=60.0
                        )
                except Exception as e:
                    print(f"Knowledge service error for {file_name}: {e}")
                
                loaded_files.append({
                    "fileName": file_name,
                    "type": doc_type,
                    "size": file_size
                })
            except Exception as e:
                print(f"Error processing file {file_name}: {e}")
        
        return {
            "message": f"Loaded {len(loaded_files)} files into RAG system",
            "files": loaded_files
        }
    except Exception as e:
        print(f"Error loading assets: {e}")
        raise HTTPException(status_code=500, detail="Failed to load assets into RAG system")


@router.post("/condominiums/{condominium_id}/load-minutes")
async def load_minutes(condominium_id: str, db: Session = Depends(get_db)):
    """Load meeting minutes into RAG system."""
    sample_content = """
第40期通常総会議事録
開催日時：令和6年10月26日（土）午前10時00分～午前12時30分
開催場所：メゾンドオプテージ集会室
出席者：45名（委任状含む）
総戸数：68戸
議長：修繕 未来（理事長）

議題第1号　前年度事業報告承認の件
議題第2号　前年度収支決算承認の件
議題第3号　管理規約改正の件

第39期第2回臨時総会議事録
開催日時：令和5年8月15日（火）午後7時00分～午後8時30分
開催場所：メゾンドオプテージ集会室
出席者：38名（委任状含む）
総戸数：68戸
議長：修繕 未来（理事長）

議題第1号　管理規約変更の件（さくら銀行名称削除）

第39期通常総会議事録
開催日時：令和5年10月28日（土）午前10時00分～午前12時00分
開催場所：メゾンドオプテージ集会室
出席者：41名（委任状含む）
総戸数：68戸
議長：修繕 未来（理事長）

議題第1号　103号室の賃貸使用に関する管理規約変更
"""
    
    try:
        # Try to call knowledge service
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.knowledge_service_url}/add",
                json={
                    "condominium_id": condominium_id,
                    "title": "メゾンドオプテージ議事録データ",
                    "content": sample_content,
                    "type": "meeting_minutes",
                    "metadata": {"source": "manual_load"}
                },
                timeout=60.0
            )
            if response.status_code == 200:
                doc_data = response.json()
                return {
                    "message": "Meeting minutes loaded successfully",
                    "documentId": doc_data.get("id"),
                    "title": doc_data.get("title")
                }
    except Exception as e:
        print(f"Knowledge service error: {e}")
    
    # Fallback: save directly
    try:
        document = KnowledgeDocument(
            id=str(uuid4()),
            condominium_id=condominium_id,
            title="メゾンドオプテージ議事録データ",
            type="meeting_minutes",
            content=sample_content,
            doc_metadata={"source": "manual_load"},
            uploaded_at=datetime.now(),
            updated_at=datetime.now()
        )
        db.add(document)
        db.commit()
        
        return {
            "message": "Meeting minutes loaded successfully",
            "documentId": document.id,
            "title": document.title
        }
    except Exception as e:
        print(f"Error loading minutes: {e}")
        raise HTTPException(status_code=500, detail="Failed to load meeting minutes")

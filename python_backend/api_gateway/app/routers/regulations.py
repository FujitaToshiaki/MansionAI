"""Regulations API endpoints."""

import json
import os
from datetime import datetime
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import text
import httpx

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from shared.utils.database import get_db
from shared.utils.config import get_settings
from shared.models.database import (
    Regulation,
    RevisionHeader,
    Activity,
)
from shared.schemas.api import (
    RegulationResponse,
    RevisionHeaderResponse,
)

router = APIRouter()
settings = get_settings()


# Mock revision headers data
MOCK_REVISION_HEADERS = [
    {
        "id": "3125710f-b498-4949-86e2-b01bc9fcc13a",
        "year": 7,
        "title": "令和7年度改訂対応",
        "status": "in_progress",
        "total_items": 8,
        "completed_items": 6,
        "assignee": "修繕 未来",
        "actual_total_items": 8,
        "actual_completed_items": 6
    },
    {
        "id": "2125710f-b498-4949-86e2-b01bc9fcc13b",
        "year": 6,
        "title": "令和6年度改訂対応",
        "status": "completed",
        "total_items": 8,
        "completed_items": 8,
        "assignee": "佐藤花子",
        "actual_total_items": 8,
        "actual_completed_items": 8
    },
    {
        "id": "1125710f-b498-4949-86e2-b01bc9fcc13c",
        "year": 5,
        "title": "令和5年度改訂対応",
        "status": "completed",
        "total_items": 5,
        "completed_items": 5,
        "assignee": "山田次郎",
        "actual_total_items": 5,
        "actual_completed_items": 5
    }
]


@router.get("/revision-headers")
async def get_revision_headers(db: Session = Depends(get_db)):
    """Get all revision headers."""
    try:
        headers = db.query(RevisionHeader).order_by(RevisionHeader.year.desc()).all()
        if headers:
            return [RevisionHeaderResponse.model_validate(h) for h in headers]
    except Exception as e:
        print(f"Error fetching revision headers: {e}")
    
    return MOCK_REVISION_HEADERS


@router.get("/revision-headers/{header_id}")
async def get_revision_header(header_id: str, db: Session = Depends(get_db)):
    """Get revision header with revisions."""
    # Return mock detailed data for the specific header
    if header_id == "3125710f-b498-4949-86e2-b01bc9fcc13a":
        return {
            "header": {
                "id": "3125710f-b498-4949-86e2-b01bc9fcc13a",
                "year": "令和7年度",
                "title": "建替え・大規模修繕の決議要件緩和",
                "status": "in_progress",
                "total_items": 15,
                "completed_items": 8,
                "assignee": "修繕 未来"
            },
            "revisions": [
                {
                    "id": 1,
                    "title": "住宅宿泊事業法の具体的明記",
                    "category": "住宅宿泊事業",
                    "article_number": "第12条",
                    "current_text": "区分所有者は、その専有部分を住宅宿泊事業法第3条第1項の届出を行うことなく、同法第2条第3項に規定する住宅宿泊事業に使用してはならない。",
                    "proposed_text": "区分所有者は、その専有部分を住宅宿泊事業法第3条第1項の届出を行うことなく、同法第2条第3項に規定する住宅宿泊事業に使用してはならない。ただし、旅館業法の許可を受けている場合は、この限りでない。",
                    "reason": "本マンションは、平成30年の住宅宿泊事業法施行時に規約改正を行っているが、旅館業法の許可を受けた場合の例外規定が未整備である。",
                    "impact": "住宅宿泊事業と旅館業の区別が明確になり、法的リスクが軽減されます。",
                    "status": "completed"
                },
                {
                    "id": 2,
                    "title": "オンライン総会開催規定",
                    "category": "総会関連",
                    "article_number": "第15条",
                    "current_text": "総会は、区分所有者全員で構成し、管理者が招集する。",
                    "proposed_text": "総会は、区分所有者全員で構成し、管理者が招集する。総会は、区分所有者が一堂に会する方法のほか、区分所有者のうち一人又は複数人が電磁的方法により出席する方法によることができる。",
                    "reason": "コロナ禍を契機としたオンライン総会の需要が高まっており、令和7年度標準管理規約でも電磁的方法による出席が明文化された。",
                    "impact": "オンライン総会の実施根拠が明確になり、参加率向上が期待できます。",
                    "status": "in_progress"
                }
            ]
        }
    
    raise HTTPException(status_code=404, detail="Revision header not found")


@router.get("/regulation-revisions")
async def get_regulation_revisions(db: Session = Depends(get_db)):
    """Get all regulation revisions."""
    try:
        result = db.execute(text(
            "SELECT * FROM regulation_revisions ORDER BY created_at DESC, id ASC"
        ))
        rows = result.fetchall()
        if rows:
            return [dict(row._mapping) for row in rows]
    except Exception as e:
        print(f"Error fetching regulation revisions: {e}")
    
    return []


@router.get("/regulation-revisions/{revision_id}")
async def get_regulation_revision(revision_id: str, db: Session = Depends(get_db)):
    """Get specific regulation revision."""
    try:
        result = db.execute(
            text("SELECT * FROM regulation_revisions WHERE id = :id"),
            {"id": revision_id}
        )
        row = result.fetchone()
        if row:
            return dict(row._mapping)
    except Exception as e:
        print(f"Error fetching regulation revision: {e}")
    
    raise HTTPException(status_code=404, detail="Regulation revision not found")


@router.patch("/regulation-revisions/{revision_id}")
async def update_regulation_revision(
    revision_id: str,
    proposed_text: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Update regulation revision."""
    try:
        db.execute(
            text("UPDATE regulation_revisions SET proposed_text = :text, updated_at = :now WHERE id = :id"),
            {"text": proposed_text, "now": datetime.now(), "id": revision_id}
        )
        db.commit()
    except Exception as e:
        print(f"Error updating regulation revision: {e}")
    
    return {
        "id": revision_id,
        "proposed_text": proposed_text,
        "message": "Revision updated successfully"
    }


@router.get("/condominiums/{condominium_id}/regulations")
async def get_condominium_regulations(condominium_id: str, db: Session = Depends(get_db)):
    """Get regulations for a condominium."""
    try:
        regulations = db.query(Regulation).filter(
            Regulation.condominium_id == condominium_id
        ).all()
        if regulations:
            return [RegulationResponse.model_validate(r) for r in regulations]
    except Exception as e:
        print(f"Error fetching regulations: {e}")
    
    return []


@router.get("/standard-regulations")
async def get_standard_regulations(db: Session = Depends(get_db)):
    """Get standard regulations."""
    return []


@router.get("/condominiums/{condominium_id}/regulation-analysis")
async def get_regulation_analysis(condominium_id: str, db: Session = Depends(get_db)):
    """Get regulation analysis results."""
    try:
        result = db.execute(text(f"""
            SELECT *, 
                CASE 
                    WHEN status IS NULL THEN 'completed'
                    ELSE status 
                END as status,
                '2024年' as revision_year
            FROM regulation_analysis_results 
            WHERE condominium_id = '{condominium_id}'
            ORDER BY 
                CASE priority 
                    WHEN 'high' THEN 1 
                    WHEN 'medium' THEN 2 
                    WHEN 'low' THEN 3 
                END, 
                created_at DESC
        """))
        rows = result.fetchall()
        
        issues = [dict(row._mapping) for row in rows]
        return {
            "totalIssues": len(issues),
            "issues": issues
        }
    except Exception as e:
        print(f"Error fetching regulation analysis: {e}")
    
    return {"totalIssues": 0, "issues": []}


@router.get("/condominiums/{condominium_id}/regulation-analysis/{revision_id}")
async def get_specific_analysis(
    condominium_id: str,
    revision_id: str,
    db: Session = Depends(get_db)
):
    """Get specific regulation analysis result."""
    try:
        result = db.execute(text(f"""
            SELECT * FROM regulation_analysis_results 
            WHERE condominium_id = '{condominium_id}' AND id = '{revision_id}'
        """))
        row = result.fetchone()
        if row:
            return dict(row._mapping)
    except Exception as e:
        print(f"Error fetching specific analysis: {e}")
    
    raise HTTPException(status_code=404, detail="Analysis result not found")


@router.post("/condominiums/{condominium_id}/start-regulation-analysis")
async def start_regulation_analysis(
    condominium_id: str,
    settings_data: Optional[dict] = Body(None),
    db: Session = Depends(get_db)
):
    """Start regulation analysis."""
    task_id = f"REG_ANALYSIS_{int(datetime.now().timestamp() * 1000)}"
    
    try:
        # Create AI task
        db.execute(text(f"""
            INSERT INTO ai_tasks (task_id, task_type, agent_type, condominium_id, status, settings, estimated_duration)
            VALUES ('{task_id}', '規約改定分析', '規約分析エージェント', '{condominium_id}', 'running', '{json.dumps(settings_data or {})}', 15)
        """))
        db.commit()
        
        # Try to call analysis service
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    f"{settings.analysis_service_url}/analyze/{condominium_id}",
                    json={"task_id": task_id, "settings": settings_data},
                    timeout=5.0
                )
        except Exception as e:
            print(f"Analysis service call failed: {e}")
    except Exception as e:
        print(f"Error starting analysis: {e}")
    
    return {
        "taskId": task_id,
        "message": "規約改定分析を開始しました"
    }


@router.get("/condominiums/{condominium_id}/ai-revision-options")
async def get_ai_revision_options(condominium_id: str):
    """Get AI revision options."""
    return []


@router.get("/condominiums/{condominium_id}/ai-generation-status")
async def get_ai_generation_status(condominium_id: str):
    """Get AI generation status."""
    return {
        "isProcessing": False,
        "currentTask": None,
        "progress": 100
    }


@router.post("/condominiums/{condominium_id}/generate-ai-revision")
async def generate_ai_revision(
    condominium_id: str,
    article: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Generate AI revision."""
    try:
        activity = Activity(
            id=str(uuid4()),
            condominium_id=condominium_id,
            type="ai_analysis",
            description=f"{article}のAI改訂案生成を開始しました",
            status="in_progress",
            user_id="mock-user-id",
            metadata={"article": article},
            created_at=datetime.now()
        )
        db.add(activity)
        db.commit()
    except Exception as e:
        print(f"Error generating AI revision: {e}")
    
    return {"message": "AI revision generation started"}


@router.post("/condominiums/{condominium_id}/confirm-revision")
async def confirm_revision(
    condominium_id: str,
    selected_option: Optional[str] = Body(None, alias="selectedOption"),
    custom_edit: Optional[str] = Body(None, alias="customEdit"),
    article: str = Body(...),
    db: Session = Depends(get_db)
):
    """Confirm revision."""
    try:
        activity = Activity(
            id=str(uuid4()),
            condominium_id=condominium_id,
            type="regulation_revision",
            description=f"{article}の改訂案を確定しました",
            status="success",
            user_id="mock-user-id",
            metadata={"selectedOption": selected_option, "article": article},
            created_at=datetime.now()
        )
        db.add(activity)
        db.commit()
    except Exception as e:
        print(f"Error confirming revision: {e}")
    
    return {"message": "Revision confirmed successfully"}


@router.get("/condominiums/{condominium_id}/analysis")
async def get_analysis_redirect(condominium_id: str, db: Session = Depends(get_db)):
    """Redirect to regulation-analysis endpoint."""
    return await get_regulation_analysis(condominium_id, db)


@router.get("/condominiums/{condominium_id}/extraction-results")
async def get_extraction_results(condominium_id: str):
    """Get extraction results."""
    return {"totalDecisions": 3}

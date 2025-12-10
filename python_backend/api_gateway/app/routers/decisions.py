"""Decisions API endpoints."""

import os
from datetime import datetime
from typing import List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
import httpx

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

from shared.utils.database import get_db
from shared.utils.config import get_settings
from shared.models.database import Activity

router = APIRouter()
settings = get_settings()


# Mock decisions data (from original routes.ts)
MOCK_DECISIONS = [
    {
        "id": "decision-1",
        "meetingDate": "2024年10月",
        "meetingType": "第40期通常総会",
        "category": "管理規約改定",
        "agenda": "メゾンドオプテージマンション管理規約変更の件",
        "decision": "メゾンドオプテージマンション管理規約変更を承認",
        "result": "approved",
        "votingResults": None,
        "relatedArticle": "管理規約第25条 組合管理部分の管理"
    },
    {
        "id": "decision-2",
        "meetingDate": "2024年8月",
        "meetingType": "第40期第2回臨時総会",
        "category": "管理規約改定",
        "agenda": "管理規約変更の件",
        "decision": "管理規約変更を承認（さくら銀行の名称削除）",
        "result": "approved",
        "votingResults": None,
        "relatedArticle": "管理規約第15条〜第19条、附則第4条、末尾表示(4)-イ"
    },
    {
        "id": "decision-3",
        "meetingDate": "2023年10月",
        "meetingType": "第39期通常総会",
        "category": "賃貸使用",
        "agenda": "旧管理人居室（103号室）の賃貸使用に伴う管理規約変更の件・使用細則変更の件",
        "decision": "旧管理人居室の賃貸使用に伴う管理規約・使用細則変更を承認",
        "result": "approved",
        "votingResults": None,
        "relatedArticle": "管理規約第17条、末尾表記 組合賃貸住宅使用細則制定"
    },
    {
        "id": "decision-4",
        "meetingDate": "2023年5月",
        "meetingType": "第39期臨時総会",
        "category": "総会運営",
        "agenda": "管理規約改訂（通常総会開催月変更）の件",
        "decision": "管理規約改訂（通常総会開催月変更）を承認",
        "result": "approved",
        "votingResults": None,
        "relatedArticle": "管理規約第55条第2項"
    },
    {
        "id": "decision-5",
        "meetingDate": "2022年9月",
        "meetingType": "第38期通常総会",
        "category": "防犯設備",
        "agenda": "防犯カメラ使用細則制定の件",
        "decision": "防犯カメラ使用細則制定を承認",
        "result": "approved",
        "votingResults": None,
        "relatedArticle": "使用細則第8条（防犯カメラ）"
    },
    {
        "id": "decision-6",
        "meetingDate": "2020年9月",
        "meetingType": "第36期通常総会",
        "category": "設備追加",
        "agenda": "宅配ボックス設置及び使用細則変更承認の件",
        "decision": "宅配ボックス設置及び使用細則変更を承認",
        "result": "approved",
        "votingResults": None,
        "relatedArticle": "使用細則第7条（宅配ボックス）"
    },
    {
        "id": "decision-7",
        "meetingDate": "2019年9月",
        "meetingType": "第35期通常総会",
        "category": "駐輪場",
        "agenda": "管理規約の変更（規約原本）の件・管理規約第16条及び自転車置場使用契約書一部変更の件",
        "decision": "管理規約変更・自転車置場使用契約書変更を承認",
        "result": "approved",
        "votingResults": None,
        "relatedArticle": "管理規約第80条 管理規約第16条 使用契約書第2条第2・4・5項"
    },
    {
        "id": "decision-8",
        "meetingDate": "2019年9月",
        "meetingType": "第35期通常総会",
        "category": "バイク置場",
        "agenda": "ミニバイク・バイク置場使用契約書変更の件",
        "decision": "ミニバイク・バイク置場使用契約書変更を承認",
        "result": "approved",
        "votingResults": None,
        "relatedArticle": "第2条第2・4・5・6項"
    },
    {
        "id": "decision-9",
        "meetingDate": "2018年9月",
        "meetingType": "第34期通常総会",
        "category": "住宅宿泊",
        "agenda": "住宅宿泊事業に関する管理規約変更の件",
        "decision": "住宅宿泊事業に関する管理規約変更を承認",
        "result": "approved",
        "votingResults": None,
        "relatedArticle": "管理規約第12条"
    },
    {
        "id": "decision-10",
        "meetingDate": "2017年9月",
        "meetingType": "第33期通常総会",
        "category": "駐車場",
        "agenda": "駐車場使用契約書変更の件",
        "decision": "駐車場使用契約書変更を承認",
        "result": "approved",
        "votingResults": None,
        "relatedArticle": "駐車場使用契約書第2条第2・4・5項"
    },
    {
        "id": "decision-11",
        "meetingDate": "2015年9月",
        "meetingType": "第31期通常総会",
        "category": "駐輪場",
        "agenda": "駐輪場料金減額改定の件",
        "decision": "駐輪場料金減額改定を承認",
        "result": "approved",
        "votingResults": None,
        "relatedArticle": "管理規約 (6)駐車場・自転車置場使用料"
    },
    {
        "id": "decision-12",
        "meetingDate": "2010年9月",
        "meetingType": "第26期通常総会",
        "category": "ペット飼育",
        "agenda": "管理規約一部改正並びにペット飼育規則制定承認の件",
        "decision": "管理規約一部改正並びにペット飼育規則制定を承認",
        "result": "approved",
        "votingResults": None,
        "relatedArticle": "管理規約第20条、ペット使用規則NO.34-38"
    },
    {
        "id": "decision-13",
        "meetingDate": "2008年9月",
        "meetingType": "第24期通常総会",
        "category": "役員運営",
        "agenda": "管理規約改正承認の件(外部オーナ特別協力金・役員定数・役員任期)",
        "decision": "管理規約改正を承認(外部オーナ特別協力金・役員定数・役員任期)",
        "result": "approved",
        "votingResults": None,
        "relatedArticle": "管理規約第28条・管理規約第44条・管理規約第46条"
    },
    {
        "id": "decision-14",
        "meetingDate": "1997年9月",
        "meetingType": "第13期通常総会",
        "category": "修繕工事",
        "agenda": "管理規約第31条、第79条改定及び第82条追加並びに住宅の模様替え及び修繕等に関する協定追加承認の件",
        "decision": "管理規約第31条、第79条改定及び第82条追加等を承認",
        "result": "approved",
        "votingResults": None,
        "relatedArticle": "管理規約第31条、第79条、第82条"
    }
]


@router.get("/condominiums/{condominium_id}/decisions")
async def get_decisions(condominium_id: str, db: Session = Depends(get_db)):
    """Get decisions for a condominium."""
    try:
        # Try to get from knowledge service
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.knowledge_service_url}/decisions/{condominium_id}",
                timeout=30.0
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"Knowledge service error: {e}")
    
    # Return mock decisions
    return MOCK_DECISIONS


@router.post("/condominiums/{condominium_id}/confirm-decisions")
async def confirm_decisions(
    condominium_id: str,
    decisions: List[dict] = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Confirm extracted decisions."""
    try:
        # Create activity
        activity = Activity(
            id=str(uuid4()),
            condominium_id=condominium_id,
            type="decision_extraction",
            description=f"{len(decisions)}件の決議事項を確定しました",
            status="success",
            user_id="mock-user-id",
            metadata={"decisionCount": len(decisions)},
            created_at=datetime.now()
        )
        db.add(activity)
        db.commit()
    except Exception as e:
        print(f"Error confirming decisions: {e}")
    
    return {"message": "Decisions confirmed successfully"}


@router.get("/condominiums/{condominium_id}/minutes")
async def get_minutes(condominium_id: str, db: Session = Depends(get_db)):
    """Get meeting minutes for a condominium."""
    try:
        # Try to get from knowledge service
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.knowledge_service_url}/minutes/{condominium_id}",
                timeout=30.0
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"Knowledge service error: {e}")
    
    # Return empty list as fallback
    return []


@router.get("/condominiums/{condominium_id}/minutes/{minute_id}")
async def get_minute_detail(
    condominium_id: str,
    minute_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed meeting minute."""
    try:
        # Try to get from knowledge service
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.knowledge_service_url}/minutes/{condominium_id}/{minute_id}",
                timeout=30.0
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"Knowledge service error: {e}")
    
    raise HTTPException(status_code=404, detail="Meeting minute not found")

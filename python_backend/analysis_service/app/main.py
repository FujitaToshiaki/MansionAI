"""Regulation Analysis Service - Main entry point."""

import os
import sys
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, Body, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Add shared module to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from shared.utils.database import get_db, init_db
from shared.utils.config import get_settings
from shared.models.database import (
    AiTask,
    RegulationAnalysisResult,
)

from .pipeline import AnalysisPipeline
from .tasks import run_analysis_task

settings = get_settings()
pipeline = None


class AnalysisRequest(BaseModel):
    task_id: str
    settings: Optional[dict] = None


class AnalysisResultResponse(BaseModel):
    id: str
    condominium_id: str
    priority: str
    article: str
    current_text: Optional[str] = None
    proposed_text: Optional[str] = None
    reason: Optional[str] = None
    impact: Optional[str] = None
    legal_basis: Optional[str] = None
    law_revision_required: bool = False
    status: str = "pending"


class AnalysisStatusResponse(BaseModel):
    task_id: str
    status: str
    progress: int
    current_step: Optional[str] = None
    results_count: int = 0


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    global pipeline
    
    # Startup
    print("Analysis Service starting up...")
    
    # Initialize database
    try:
        init_db()
        print("Database initialized")
    except Exception as e:
        print(f"Database initialization warning: {e}")
    
    # Initialize pipeline
    pipeline = AnalysisPipeline()
    print("Analysis pipeline initialized")
    
    yield
    
    # Shutdown
    print("Analysis Service shutting down...")


app = FastAPI(
    title="MansionAI Analysis Service",
    description="Regulation Analysis Service with 6-step AI pipeline",
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
    return {"message": "MansionAI Analysis Service", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "pipeline_ready": pipeline is not None
    }


@app.post("/analyze/{condominium_id}")
async def start_analysis(
    condominium_id: str,
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Start regulation analysis for a condominium."""
    try:
        # Check if task already exists
        existing_task = db.query(AiTask).filter(
            AiTask.task_id == request.task_id
        ).first()
        
        if not existing_task:
            # Create new task
            task = AiTask(
                task_id=request.task_id,
                task_type="規約改定分析",
                agent_type="規約分析エージェント",
                condominium_id=condominium_id,
                status="queued",
                settings=request.settings or {},
                estimated_duration=15,
                progress=0,
                current_step="初期化中"
            )
            db.add(task)
            db.commit()
        
        # Start background analysis
        background_tasks.add_task(
            run_analysis_task,
            request.task_id,
            condominium_id,
            request.settings
        )
        
        return {
            "taskId": request.task_id,
            "status": "started",
            "message": "規約改定分析を開始しました"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start analysis: {str(e)}")


@app.get("/analyze/{condominium_id}/status/{task_id}", response_model=AnalysisStatusResponse)
async def get_analysis_status(
    condominium_id: str,
    task_id: str,
    db: Session = Depends(get_db)
):
    """Get analysis task status."""
    try:
        task = db.query(AiTask).filter(
            AiTask.task_id == task_id,
            AiTask.condominium_id == condominium_id
        ).first()
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Count results
        results_count = db.query(RegulationAnalysisResult).filter(
            RegulationAnalysisResult.condominium_id == condominium_id
        ).count()
        
        return AnalysisStatusResponse(
            task_id=task.task_id,
            status=task.status,
            progress=task.progress or 0,
            current_step=task.current_step,
            results_count=results_count
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")


@app.get("/analyze/{condominium_id}/results", response_model=List[AnalysisResultResponse])
async def get_analysis_results(
    condominium_id: str,
    db: Session = Depends(get_db)
):
    """Get analysis results for a condominium."""
    try:
        results = db.query(RegulationAnalysisResult).filter(
            RegulationAnalysisResult.condominium_id == condominium_id
        ).order_by(
            RegulationAnalysisResult.priority.desc(),
            RegulationAnalysisResult.created_at.desc()
        ).all()
        
        return [
            AnalysisResultResponse(
                id=r.id,
                condominium_id=r.condominium_id,
                priority=r.priority,
                article=r.article,
                current_text=r.current_text,
                proposed_text=r.proposed_text,
                reason=r.reason,
                impact=r.impact,
                legal_basis=r.legal_basis,
                law_revision_required=r.law_revision_required or False,
                status=r.status or "pending"
            )
            for r in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get results: {str(e)}")


@app.post("/analyze/{condominium_id}/step")
async def run_single_step(
    condominium_id: str,
    step: int = Body(..., embed=True),
    task_id: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Run a single analysis step."""
    try:
        if not pipeline:
            raise HTTPException(status_code=500, detail="Pipeline not initialized")
        
        # Update task status
        task = db.query(AiTask).filter(AiTask.task_id == task_id).first()
        if task:
            task.current_step = pipeline.STEPS[step - 1] if step <= len(pipeline.STEPS) else "完了"
            task.progress = int((step / len(pipeline.STEPS)) * 100)
            db.commit()
        
        # Run step
        result = await pipeline.run_step(step, condominium_id, db)
        
        return {
            "step": step,
            "stepName": pipeline.STEPS[step - 1] if step <= len(pipeline.STEPS) else "完了",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to run step: {str(e)}")


@app.post("/analyze/{condominium_id}/cancel/{task_id}")
async def cancel_analysis(
    condominium_id: str,
    task_id: str,
    db: Session = Depends(get_db)
):
    """Cancel an ongoing analysis."""
    try:
        task = db.query(AiTask).filter(
            AiTask.task_id == task_id,
            AiTask.condominium_id == condominium_id
        ).first()
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        task.status = "cancelled"
        task.completed_at = datetime.now()
        db.commit()
        
        return {"message": "Analysis cancelled", "taskId": task_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", "8003"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )

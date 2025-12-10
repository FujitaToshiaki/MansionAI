"""Background tasks for regulation analysis."""

import asyncio
from datetime import datetime
from typing import Any, Dict, Optional

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from shared.utils.database import get_session_factory
from shared.models.database import AiTask, Activity

from .pipeline import AnalysisPipeline


async def run_analysis_task(
    task_id: str,
    condominium_id: str,
    settings: Optional[Dict[str, Any]] = None
):
    """Run the full analysis pipeline as a background task.
    
    Args:
        task_id: ID of the AI task
        condominium_id: ID of the condominium to analyze
        settings: Optional analysis settings
    """
    # Get database session
    SessionLocal = get_session_factory()
    db = SessionLocal()
    
    try:
        # Update task status to running
        task = db.query(AiTask).filter(AiTask.task_id == task_id).first()
        if task:
            task.status = "running"
            task.started_at = datetime.now()
            db.commit()
        
        # Initialize pipeline
        pipeline = AnalysisPipeline()
        
        # Run each step
        for step in range(1, 7):
            # Check if task was cancelled
            db.refresh(task) if task else None
            if task and task.status == "cancelled":
                print(f"Task {task_id} was cancelled")
                return
            
            # Update progress
            if task:
                task.current_step = pipeline.STEPS[step - 1]
                task.progress = int((step / 6) * 100)
                db.commit()
            
            print(f"Running step {step}: {pipeline.STEPS[step - 1]}")
            
            # Run the step
            try:
                result = await pipeline.run_step(step, condominium_id, db, settings)
                print(f"Step {step} completed: {result.get('status')}")
            except Exception as e:
                print(f"Error in step {step}: {e}")
                if task:
                    task.status = "failed"
                    task.error_message = str(e)
                    db.commit()
                raise
            
            # Delay between steps
            await asyncio.sleep(2)
        
        # Mark task as completed
        if task:
            task.status = "completed"
            task.progress = 100
            task.current_step = "完了"
            task.completed_at = datetime.now()
            db.commit()
        
        # Create activity record
        activity = Activity(
            id=str(datetime.now().timestamp()),
            condominium_id=condominium_id,
            type="ai_analysis",
            description="規約改定分析が完了しました",
            status="success",
            user_id="system",
            metadata={"taskId": task_id},
            created_at=datetime.now()
        )
        db.add(activity)
        db.commit()
        
        print(f"Analysis task {task_id} completed successfully")
        
    except Exception as e:
        print(f"Analysis task {task_id} failed: {e}")
        
        # Update task status
        task = db.query(AiTask).filter(AiTask.task_id == task_id).first()
        if task:
            task.status = "failed"
            task.error_message = str(e)
            task.completed_at = datetime.now()
            db.commit()
        
        raise
    
    finally:
        db.close()


def run_analysis_sync(
    task_id: str,
    condominium_id: str,
    settings: Optional[Dict[str, Any]] = None
):
    """Synchronous wrapper for running analysis task.
    
    This can be used with Celery or other task queues.
    
    Args:
        task_id: ID of the AI task
        condominium_id: ID of the condominium to analyze
        settings: Optional analysis settings
    """
    asyncio.run(run_analysis_task(task_id, condominium_id, settings))


# Celery task definition (optional, for use with Celery)
try:
    from celery import Celery
    
    celery_app = Celery(
        "analysis_tasks",
        broker=os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
        backend=os.environ.get("REDIS_URL", "redis://localhost:6379/0")
    )
    
    @celery_app.task(name="analysis.run_analysis")
    def celery_run_analysis(
        task_id: str,
        condominium_id: str,
        settings: Optional[Dict[str, Any]] = None
    ):
        """Celery task for running analysis."""
        run_analysis_sync(task_id, condominium_id, settings)
    
except ImportError:
    # Celery not installed, skip
    celery_app = None
    celery_run_analysis = None

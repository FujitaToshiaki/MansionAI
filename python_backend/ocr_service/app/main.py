"""OCR Service - Main entry point."""

import os
import sys
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add shared module to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from .gemini_client import GeminiOCRClient
from .ocr_processor import OCRProcessor

# Initialize clients
gemini_client = None
ocr_processor = None


class LowConfidenceRegion(BaseModel):
    text: str
    confidence: float
    coordinates: dict


class OCRResult(BaseModel):
    text: str
    accuracy: float
    low_confidence_regions: List[LowConfidenceRegion] = []


class OCRPageResult(BaseModel):
    page_number: int
    text: str
    accuracy: float
    low_confidence_regions: List[LowConfidenceRegion] = []


class OCRProcessResponse(BaseModel):
    success: bool
    results: List[OCRPageResult]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    global gemini_client, ocr_processor
    
    # Startup
    print("OCR Service starting up...")
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    if gemini_api_key:
        gemini_client = GeminiOCRClient(gemini_api_key)
        ocr_processor = OCRProcessor(gemini_client)
        print("Gemini API client initialized")
    else:
        print("WARNING: GEMINI_API_KEY not set, OCR will return mock results")
    
    yield
    
    # Shutdown
    print("OCR Service shutting down...")


app = FastAPI(
    title="MansionAI OCR Service",
    description="OCR Service using Gemini 2.0 Flash API for Japanese text extraction",
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
    return {"message": "MansionAI OCR Service", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "gemini_configured": gemini_client is not None
    }


@app.post("/process", response_model=OCRProcessResponse)
async def process_ocr(files: List[UploadFile] = File(...)):
    """Process OCR on uploaded image files."""
    if not files:
        raise HTTPException(status_code=400, detail="ファイルがアップロードされていません")
    
    results = []
    
    for i, file in enumerate(files):
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail=f"画像ファイルのみアップロード可能です: {file.filename}"
            )
        
        try:
            content = await file.read()
            
            if ocr_processor:
                # Use Gemini API for OCR
                result = await ocr_processor.process_image(content, file.content_type)
                results.append(OCRPageResult(
                    page_number=i + 1,
                    text=result["text"],
                    accuracy=result["accuracy"],
                    low_confidence_regions=[
                        LowConfidenceRegion(**region)
                        for region in result.get("low_confidence_regions", [])
                    ]
                ))
            else:
                # Return mock result if Gemini not configured
                results.append(OCRPageResult(
                    page_number=i + 1,
                    text=f"[OCR処理結果: ページ {i + 1}]\n議事録テキストがここに表示されます。\n\nGemini APIキーが設定されていないため、モックデータを返しています。",
                    accuracy=92.5,
                    low_confidence_regions=[]
                ))
        except Exception as e:
            print(f"Error processing image {i + 1}: {e}")
            results.append(OCRPageResult(
                page_number=i + 1,
                text=f"[OCR処理エラー: ページ {i + 1}]\nエラー: {str(e)}",
                accuracy=0,
                low_confidence_regions=[]
            ))
    
    return OCRProcessResponse(success=True, results=results)


@app.post("/process-single", response_model=OCRResult)
async def process_single_image(file: UploadFile = File(...)):
    """Process OCR on a single image file."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="画像ファイルのみアップロード可能です"
        )
    
    try:
        content = await file.read()
        
        if ocr_processor:
            result = await ocr_processor.process_image(content, file.content_type)
            return OCRResult(
                text=result["text"],
                accuracy=result["accuracy"],
                low_confidence_regions=[
                    LowConfidenceRegion(**region)
                    for region in result.get("low_confidence_regions", [])
                ]
            )
        else:
            return OCRResult(
                text="[OCR処理結果]\nGemini APIキーが設定されていないため、モックデータを返しています。",
                accuracy=92.5,
                low_confidence_regions=[]
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR処理エラー: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", "8001"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )

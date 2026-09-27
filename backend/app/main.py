from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .adapters.ai_adapter import ai_adapter
from .schemas.all_schemas import (
    GenerateCaptionRequest,
    GenerateResponse,
    DraftCreateRequest,
    DraftResponse
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "The Creator Crew API"}

@app.post(f"{settings.API_V1_STR}/generate", response_model=GenerateResponse)
def generate_captions(req: GenerateCaptionRequest):
    return ai_adapter.generate(req.prompt, req.tone)

@app.get(f"{settings.API_V1_STR}/drafts")
def list_drafts():
    return {"message": "Draft Vault endpoint active"}

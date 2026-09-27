from typing import List, Optional
from pydantic import BaseModel

class UserRegisterRequest(BaseModel):
    email: str
    mobile_number: str
    brand_tone: Optional[str] = "Aesthetic"

class VerifyOtpRequest(BaseModel):
    email: str
    otp: str

class GenerateCaptionRequest(BaseModel):
    prompt: str
    tone: str = "Aesthetic"

class CaptionVariantResponse(BaseModel):
    id: str
    hook: str
    text: str
    tone: str
    style_match_score: int
    hashtags: List[str]

class GenerateResponse(BaseModel):
    variants: List[CaptionVariantResponse]
    hashtags: List[str]
    latency_ms: int

class DraftCreateRequest(BaseModel):
    content: str
    tag: Optional[str] = None

class DraftResponse(BaseModel):
    id: str
    content: str
    tag: str
    version_no: int
    review_status: str

class DraftRevertRequest(BaseModel):
    version_no: int

class SchedulePostRequest(BaseModel):
    draft_id: str
    platform: str
    scheduled_time: str
    override_time: bool = False

class AnalyzeDraftRequest(BaseModel):
    content: str

class ReviewDecisionRequest(BaseModel):
    draft_id: str
    decision: str  # APPROVED, REWORK, DISCARDED
    feedback: Optional[str] = None

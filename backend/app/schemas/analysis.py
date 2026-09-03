"""
Pydantic schemas for Analysis request/response objects.
"""

import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class AnalysisRequest(BaseModel):
    """Request to trigger detection analysis on a media file."""
    media_id: uuid.UUID
    media_type: Optional[str] = None  # "image" | "video" | "audio" | "text" — overrides auto-detected type
    options: Optional[Dict[str, Any]] = None


class ModalityResultSchema(BaseModel):
    """Result for a single modality channel."""
    modality: str
    label: str
    confidence: float


class AnalysisResponse(BaseModel):
    """Full analysis result returned to client."""
    id: uuid.UUID
    media_id: uuid.UUID
    user_id: uuid.UUID
    provider: str
    is_demo: bool = False
    status: str
    job_id: Optional[str] = None
    label: Optional[str] = None
    confidence: Optional[float] = None
    raw_score: Optional[float] = None
    result_json: Dict[str, Any] = Field(default_factory=dict)
    explanation_json: Dict[str, Any] = Field(default_factory=dict)
    modality_results_json: List[Dict[str, Any]] = Field(default_factory=list)
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AnalysisListItem(BaseModel):
    """Compact analysis record for list views."""
    id: uuid.UUID
    media_id: uuid.UUID
    provider: str
    is_demo: bool = False
    status: str
    label: Optional[str] = None
    confidence: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AnalysisWithMedia(AnalysisResponse):
    """Analysis response enriched with media filename for dashboard display."""
    media_filename: Optional[str] = None
    media_type: Optional[str] = None

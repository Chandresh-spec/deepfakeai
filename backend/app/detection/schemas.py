"""
Detection schemas — Pydantic models for normalized detection provider inputs/outputs.
"""

from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class DetectionRequest(BaseModel):
    """Request payload sent to detection providers."""
    media_id: str
    media_type: str
    options: Optional[Dict[str, Any]] = None


class ModalityResult(BaseModel):
    """Result breakdown for a specific media modality."""
    modality: str
    label: str  # "authentic", "suspicious", "manipulated"
    confidence: float


class ExplanationFactor(BaseModel):
    """Specific explainable AI feature or anomaly factor."""
    name: str
    description: str
    impact: str  # "high", "medium", "low"
    score: float


class ExplanationResult(BaseModel):
    """Structured explainability output explaining the verdict."""
    summary: str
    factors: List[ExplanationFactor] = Field(default_factory=list)


class DetectionResult(BaseModel):
    """Normalized deepfake detection result from any provider."""
    provider: str
    is_demo: bool = False
    job_id: str
    status: str  # "completed", "pending", "failed", "unsupported"
    media_type: Optional[str] = None
    label: Optional[str] = None  # "authentic", "suspicious", "manipulated"
    confidence: Optional[float] = None
    raw_score: Optional[float] = None
    result: Optional[Dict[str, Any]] = Field(default_factory=dict)
    explanation: Optional[ExplanationResult] = None
    modality_results: List[ModalityResult] = Field(default_factory=list)
    error_message: Optional[str] = None

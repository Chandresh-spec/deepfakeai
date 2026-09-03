"""
Demo Detection Provider.
Returns clearly-labeled demonstration results for development with rich explainability factors.
"""

import random
from typing import Any, Dict, Optional
from app.detection.base import DetectionProvider

DEMO_FACTORS = {
    "image": [
        {"name": "Facial Boundary Consistency", "description": "Analysis of facial boundary pixel transitions and blending artifacts", "impact": "high"},
        {"name": "Frequency Domain Anomaly", "description": "High-frequency Fourier spectrum noise variance assessment", "impact": "high"},
        {"name": "Lighting & Shadow Alignment", "description": "Consistency of specular highlights across eyes and nasal features", "impact": "medium"},
    ],
    "video": [
        {"name": "Temporal Frame Continuity", "description": "Consistency of facial landmarks across sequential video frames", "impact": "high"},
        {"name": "Lip Sync Alignment", "description": "Correspondence between phonemes and visible lip movements", "impact": "high"},
        {"name": "Blinking Pattern Frequency", "description": "Biological eye-blink rate and eyelid motion rhythm", "impact": "medium"},
    ],
    "audio": [
        {"name": "Spectral Phase Discontinuity", "description": "Mel-spectrogram phase coherence in synthetic voice synthesis", "impact": "high"},
        {"name": "Pitch Cadence Variance", "description": "Monotone fundamental frequency (F0) contour anomalies", "impact": "high"},
        {"name": "Background Acoustic Noise", "description": "Discontinuity in background room impulse response", "impact": "low"},
    ],
    "text": [
        {"name": "Perplexity Score Variance", "description": "Cross-entropy prediction loss of token sequences", "impact": "high"},
        {"name": "Repetition & N-Gram Entropy", "description": "Statistical recurring phrase pattern density", "impact": "medium"},
        {"name": "Stylometric Consistency", "description": "Authorial vocabulary distribution and sentence complexity", "impact": "medium"},
    ],
}


class DemoDetectionProvider(DetectionProvider):
    """Demo provider returning rich synthetic results for development."""

    @property
    def provider_name(self) -> str:
        return "demo"

    async def detect(
        self,
        file_path: str,
        media_type: str,
        options: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        confidence = round(random.uniform(0.68, 0.97), 4)
        label = random.choice(["authentic", "suspicious", "manipulated"])

        modality_key = media_type if media_type in DEMO_FACTORS else "image"
        base_factors = DEMO_FACTORS[modality_key]

        factors = []
        for factor in base_factors:
            score = round(confidence * random.uniform(0.85, 1.05), 3)
            factors.append({
                "name": factor["name"],
                "description": factor["description"],
                "impact": factor["impact"],
                "score": min(1.0, score),
            })

        summary = (
            f"DEMO MODE — Synthetic AI Verdict: Media assessed as {label.upper()} "
            f"with {round(confidence * 100, 1)}% confidence using demo forensic heuristics."
        )

        return {
            "provider": "demo",
            "is_demo": True,
            "job_id": f"demo-job-{random.randint(100000, 999999)}",
            "status": "completed",
            "media_type": media_type,
            "label": label,
            "confidence": confidence,
            "raw_score": confidence,
            "result": {
                "label": label,
                "confidence": confidence,
                "raw_score": confidence,
                "provider_label": label.upper(),
                "normalized_label": label,
            },
            "explanation": {
                "summary": summary,
                "factors": factors,
            },
            "modality_results": [
                {
                    "modality": media_type,
                    "label": label,
                    "confidence": confidence,
                }
            ],
        }

    async def get_result(self, job_id: str) -> Dict[str, Any]:
        return {
            "provider": "demo",
            "is_demo": True,
            "job_id": job_id,
            "status": "completed",
        }

    def supports_modality(self, media_type: str) -> bool:
        return media_type in ("image", "video", "audio", "text")

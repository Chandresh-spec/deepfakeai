"""
Forensic Service — orchestrates Error Level Analysis (ELA), 2D FFT Spectrum, and EXIF Integrity Audits.
"""

import os
from typing import Any, Dict
from app.core.config import settings
from app.forensics.hashing import compute_sha256
from app.forensics.metadata import extract_media_metadata
from app.forensics.ela import compute_ela
from app.forensics.fft import compute_fft_spectrum


class ForensicService:
    """Orchestrates forensic analysis across media types."""

    async def analyze(self, file_path: str, media_type: str, media_id: str) -> Dict[str, Any]:
        """
        Run full deep forensic analysis pipeline on a media file asset.
        """
        if not os.path.exists(file_path):
            return {"error": "File asset not found"}

        # 1. SHA-256 Hash
        sha256_hash = compute_sha256(file_path)

        # 2. Extract Metadata
        metadata = extract_media_metadata(file_path, media_type)

        # 3. Perform Error Level Analysis (ELA) for image/video assets
        forensics_dir = os.path.join(settings.UPLOAD_DIR, "forensics")
        ela_output_path = os.path.join(forensics_dir, f"ela_{media_id}.jpg")
        
        ela_result = {}
        fft_result = {}

        if media_type in ("image", "video"):
            ela_result = compute_ela(file_path, ela_output_path)
            fft_result = compute_fft_spectrum(file_path)

        # 4. Synthesize Forensic Integrity Score & Risk Level
        ela_score = ela_result.get("ela_score", 0.0)
        fft_score = fft_result.get("fft_score", 0.0)

        composite_score = round(max(ela_score, fft_score), 4)

        if composite_score > 0.45:
            risk_level = "HIGH RISK — Digital Tampering / AI Synthesis Detected"
        elif composite_score > 0.25:
            risk_level = "MEDIUM RISK — Structural Inconsistencies Present"
        else:
            risk_level = "LOW RISK — Authentic File Compression Structure"

        return {
            "media_id": media_id,
            "media_type": media_type,
            "sha256_hash": sha256_hash,
            "metadata": metadata,
            "ela": ela_result,
            "fft": fft_result,
            "composite_forensic_score": composite_score,
            "risk_level": risk_level,
            "forensic_seal": f"SEAL-SHA256-{sha256_hash[:12].upper()}",
        }

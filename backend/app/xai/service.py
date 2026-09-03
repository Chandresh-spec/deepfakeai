"""
XAI (Explainable AI) & Forensic Service.
Coordinates authentic Model XAI (Images), Video Keyframe Forensics (Videos), and Digital Signal Forensic Analysis (Audio).
"""

import os
from typing import Any, Dict, Optional
from app.core.config import settings
from app.xai.image_xai import ImageXAIProcessor
from app.xai.video_forensics import VideoForensicProcessor
from app.xai.audio_forensics import AudioForensicProcessor
from app.xai.formatter import XAIFormatter


class XAIService:
    """Processes and enriches detection results with image/video XAI overlays and audio forensics."""

    def __init__(self):
        self.image_xai = ImageXAIProcessor()
        self.video_forensics = VideoForensicProcessor()
        self.audio_forensics = AudioForensicProcessor()
        self.formatter = XAIFormatter()

    async def process_explanation(
        self,
        file_path: str,
        media_type: str,
        label: str,
        confidence: float,
        analysis_id: str,
        raw_explanation: Optional[Dict[str, Any]] = None,
        raw_result: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Enrich explanation payload with authentic model XAI (Image), Video Temporal Forensics (Video), or DSP audio forensics (Audio).
        """
        raw_exp = raw_explanation or {}
        res_data = raw_result or {}
        xai_dir = os.path.join(settings.UPLOAD_DIR, "xai")

        xai_payload = {}
        has_heatmap = False
        heatmap_path = None

        # 1. IMAGE XAI
        if media_type == "image":
            image_xai_res = await self.image_xai.process_image_xai(
                file_path=file_path,
                analysis_id=analysis_id,
                output_dir=xai_dir,
                raw_result=res_data,
            )
            xai_payload = image_xai_res
            has_heatmap = image_xai_res.get("available", False)
            heatmap_path = image_xai_res.get("heatmap_path")

            if has_heatmap:
                raw_exp["has_heatmap"] = True
                raw_exp["heatmap_path"] = heatmap_path
                raw_exp["overlay_path"] = image_xai_res.get("overlay_path")
            else:
                raw_exp["has_heatmap"] = False

        # 2. VIDEO TEMPORAL & KEYFRAME FORENSICS
        elif media_type == "video":
            video_xai_res = self.video_forensics.process_video_keyframes(
                file_path=file_path,
                analysis_id=analysis_id,
                output_dir=xai_dir,
                overall_label=label,
                overall_confidence=confidence,
            )
            xai_payload = video_xai_res
            has_heatmap = video_xai_res.get("available", False)
            raw_exp["has_heatmap"] = has_heatmap
            raw_exp["frames"] = video_xai_res.get("frames", [])

        # 3. AUDIO FORENSICS (Acoustic Signal Processing & Spectral Anomaly Analysis)
        elif media_type == "audio":
            audio_forensics_res = self.audio_forensics.process_audio_forensics(
                file_path=file_path,
                analysis_id=analysis_id,
                output_dir=xai_dir,
            )
            xai_payload = audio_forensics_res
            raw_exp["has_heatmap"] = False

        # 4. TEXT MODALITY
        else:
            xai_payload = {
                "available": False,
                "reason": "Text analysis is evaluated via linguistic perplexity and stylometric heuristics.",
            }
            raw_exp["has_heatmap"] = False

        # 5. Format human-readable summary & factors
        formatted = self.formatter.format_explanation(raw_exp, label, confidence)
        formatted["has_heatmap"] = has_heatmap
        if heatmap_path:
            formatted["heatmap_path"] = heatmap_path

        # Attach standard structured XAI / Forensic payload
        formatted["xai"] = xai_payload

        return formatted

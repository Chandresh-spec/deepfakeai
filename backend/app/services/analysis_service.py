"""
Analysis Service — orchestrates deepfake detection and persists Analysis results.
"""

import os
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.media import MediaFile
from app.models.analysis import Analysis
from app.detection.service import DetectionService
from app.xai.service import XAIService


class AnalysisService:
    def __init__(self, db: Session):
        self.db = db
        self.detection_service = DetectionService()
        self.xai_service = XAIService()

    async def run_analysis(
        self,
        media_id: uuid.UUID,
        user_id: uuid.UUID,
        options: Optional[dict] = None,
        media_type_override: Optional[str] = None,
    ) -> Analysis:
        """
        Run deepfake detection analysis on a stored media file.
        Persists analysis record in database and returns the result.
        media_type_override: If provided, overrides the auto-detected media type
                             to route to the correct provider (image/video/audio/text).
        """
        # 1. Fetch media record & verify ownership
        media_record = (
            self.db.query(MediaFile)
            .filter(MediaFile.id == media_id, MediaFile.user_id == user_id)
            .first()
        )
        if not media_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media file asset not found",
            )

        # Use override media_type if provided, otherwise use auto-detected type
        effective_media_type = media_type_override or media_record.media_type

        # 2. Trigger detection provider with the effective media type
        raw_result = await self.detection_service.detect(
            file_path=media_record.storage_path,
            media_type=effective_media_type,
            options=options,
        )

        # 3. Extract verdict fields
        provider_name = raw_result.get("provider", self.detection_service.provider_name)
        is_demo = raw_result.get("is_demo", False)
        job_id = raw_result.get("job_id", f"job-{uuid.uuid4().hex[:8]}")
        analysis_status = raw_result.get("status", "completed")
        label = raw_result.get("label", "suspicious")
        confidence = raw_result.get("confidence", 0.5)
        raw_score = raw_result.get("raw_score", confidence)
        explanation = raw_result.get("explanation", {})
        modality_results = raw_result.get("modality_results", [])
        error_message = raw_result.get("error_message", None)

        analysis_id = uuid.uuid4()

        # 4. Enrich explanation with XAIService (real model XAI & audio forensics)
        enriched_explanation = await self.xai_service.process_explanation(
            file_path=media_record.storage_path,
            media_type=effective_media_type,
            label=label,
            confidence=confidence,
            analysis_id=str(analysis_id),
            raw_explanation=explanation,
            raw_result=raw_result,
        )

        # 5. Save Analysis record to DB
        analysis_record = Analysis(
            id=analysis_id,
            media_id=media_id,
            user_id=user_id,
            provider=provider_name,
            is_demo=is_demo,
            status=analysis_status,
            job_id=job_id,
            label=label,
            confidence=confidence,
            raw_score=raw_score,
            result_json=raw_result,
            explanation_json=enriched_explanation,
            modality_results_json=modality_results,
            error_message=error_message,
            created_at=datetime.utcnow(),
            completed_at=datetime.utcnow() if analysis_status == "completed" else None,
        )

        self.db.add(analysis_record)
        self.db.commit()
        self.db.refresh(analysis_record)

        return analysis_record

    def _ensure_xai_enrichment(self, record: Optional[Analysis]) -> Optional[Analysis]:
        """Ensure heatmap and forensic artifacts exist and are flagged available for existing records."""
        if not record or not record.explanation_json:
            return record

        exp = dict(record.explanation_json)
        xai = exp.get("xai", {})

        # If image analysis lacks active heatmap, generate it on the fly
        media_record = self.db.query(MediaFile).filter(MediaFile.id == record.media_id).first()
        if media_record and media_record.media_type == "image" and os.path.exists(media_record.storage_path):
            xai_dir = os.path.join(settings.UPLOAD_DIR, "xai")
            os.makedirs(xai_dir, exist_ok=True)
            h_path = os.path.join(xai_dir, f"{record.id}_heatmap.png")
            o_path = os.path.join(xai_dir, f"{record.id}_overlay.png")

            if not os.path.exists(h_path) or not os.path.exists(o_path):
                self.xai_service.image_xai._generate_forensic_ela_heatmap(media_record.storage_path, h_path, o_path)

            if os.path.exists(h_path) and os.path.exists(o_path):
                exp["has_heatmap"] = True
                exp["heatmap_path"] = h_path
                exp["overlay_path"] = o_path
                exp["xai"] = {
                    "available": True,
                    "method": "Resemble AI Forensic Spatial Artifact & ELA Heatmap",
                    "provider": "resemble",
                    "heatmap_path": h_path,
                    "overlay_path": o_path,
                    "heatmap_url": f"/api/v1/analysis/{record.id}/xai/image-heatmap",
                    "overlay_url": f"/api/v1/analysis/{record.id}/xai/image-overlay",
                    "legend": {
                        "red": "High synthetic inconsistency / compression boundary",
                        "yellow": "Medium anomaly gradient",
                        "blue_cyan": "Natural pixel coherence baseline",
                    },
                }
                record.explanation_json = exp
                self.db.commit()

        # If video analysis lacks active keyframes & heatmaps, generate them
        elif media_record and media_record.media_type == "video" and os.path.exists(media_record.storage_path):
            xai_dir = os.path.join(settings.UPLOAD_DIR, "xai")
            os.makedirs(xai_dir, exist_ok=True)
            existing_frames = exp.get("xai", {}).get("frames") or exp.get("frames", [])
            needs_frames = not existing_frames or not any(os.path.exists(f.get("frame_path", "")) for f in existing_frames)

            if needs_frames:
                video_res = self.xai_service.video_forensics.process_video_keyframes(
                    file_path=media_record.storage_path,
                    analysis_id=str(record.id),
                    output_dir=xai_dir,
                    overall_label=record.label or "authentic",
                    overall_confidence=record.confidence or 0.05,
                )
                exp["has_heatmap"] = video_res.get("available", True)
                exp["frames"] = video_res.get("frames", [])
                exp["xai"] = video_res
                record.explanation_json = exp
                self.db.commit()

        return record

    def get_analysis_by_id(
        self,
        analysis_id: uuid.UUID,
        user_id: Optional[uuid.UUID] = None,
    ) -> Optional[Analysis]:
        """Fetch analysis record by ID (user_id optional for media streaming)."""
        query = self.db.query(Analysis).filter(Analysis.id == analysis_id)
        if user_id:
            query = query.filter(Analysis.user_id == user_id)
        record = query.first()
        return self._ensure_xai_enrichment(record)

    def list_user_analyses(self, user_id: uuid.UUID) -> List[Analysis]:
        """List all analyses for user ordered by created_at desc."""
        records = (
            self.db.query(Analysis)
            .filter(Analysis.user_id == user_id)
            .order_by(Analysis.created_at.desc())
            .all()
        )
        return [self._ensure_xai_enrichment(r) for r in records if r]

    def list_media_analyses(
        self,
        media_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> List[Analysis]:
        """List all analyses for a specific media file."""
        records = (
            self.db.query(Analysis)
            .filter(Analysis.media_id == media_id, Analysis.user_id == user_id)
            .order_by(Analysis.created_at.desc())
            .all()
        )
        return [self._ensure_xai_enrichment(r) for r in records if r]

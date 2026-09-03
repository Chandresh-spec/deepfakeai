"""
Celery tasks — async background jobs for detection workflows.
"""

import uuid
import asyncio
from datetime import datetime
from app.workers.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.media import MediaFile
from app.models.analysis import Analysis
from app.detection.service import DetectionService
from app.xai.service import XAIService


@celery_app.task(name="tasks.ping")
def ping():
    """Health-check task for verifying Celery connectivity."""
    return "pong"


@celery_app.task(name="tasks.run_async_detection")
def run_async_detection(analysis_id_str: str, media_id_str: str, user_id_str: str, options: dict = None):
    """
    Celery background task executing deepfake detection asynchronously.
    Updates DB Analysis record with verdict, confidence, and XAI heatmap overlays.
    """
    db = SessionLocal()
    try:
        analysis_id = uuid.UUID(analysis_id_str)
        media_id = uuid.UUID(media_id_str)
        user_id = uuid.UUID(user_id_str)

        # 1. Fetch analysis record & media record
        analysis_record = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        media_record = db.query(MediaFile).filter(MediaFile.id == media_id).first()

        if not analysis_record or not media_record:
            return {"status": "error", "message": "Record not found"}

        # 2. Update status to processing
        analysis_record.status = "processing"
        db.commit()

        # 3. Execute detection
        detection_service = DetectionService()
        raw_result = asyncio.run(
            detection_service.detect(
                file_path=media_record.storage_path,
                media_type=media_record.media_type,
                options=options,
            )
        )

        label = raw_result.get("label", "suspicious")
        confidence = raw_result.get("confidence", 0.5)
        raw_score = raw_result.get("raw_score", confidence)
        explanation = raw_result.get("explanation", {})
        modality_results = raw_result.get("modality_results", [])
        error_message = raw_result.get("error_message", None)

        # 4. Enrich explanation with XAI Service
        xai_service = XAIService()
        enriched_explanation = xai_service.process_explanation(
            file_path=media_record.storage_path,
            media_type=media_record.media_type,
            label=label,
            confidence=confidence,
            analysis_id=str(analysis_id),
            raw_explanation=explanation,
        )

        # 5. Update analysis record to completed
        analysis_record.status = "completed"
        analysis_record.label = label
        analysis_record.confidence = confidence
        analysis_record.raw_score = raw_score
        analysis_record.result_json = raw_result
        analysis_record.explanation_json = enriched_explanation
        analysis_record.modality_results_json = modality_results
        analysis_record.error_message = error_message
        analysis_record.completed_at = datetime.utcnow()

        db.commit()

        return {
            "status": "completed",
            "analysis_id": analysis_id_str,
            "label": label,
            "confidence": confidence,
        }
    except Exception as e:
        if db:
            analysis_record = db.query(Analysis).filter(Analysis.id == uuid.UUID(analysis_id_str)).first()
            if analysis_record:
                analysis_record.status = "failed"
                analysis_record.error_message = str(e)
                db.commit()
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()

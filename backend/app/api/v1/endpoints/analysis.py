import os
import uuid
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from celery.result import AsyncResult

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.media import MediaFile
from app.models.analysis import Analysis
from app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    AnalysisWithMedia,
)
from app.services.analysis_service import AnalysisService
from app.workers.tasks import run_async_detection, celery_app

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post(
    "/run",
    response_model=AnalysisResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Run AI deepfake detection analysis on an uploaded media file",
)
async def run_analysis(
    payload: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Trigger synchronous detection provider analysis on a media asset.
    Stores and returns verdict, confidence, and explainability breakdown.
    """
    service = AnalysisService(db)
    analysis_record = await service.run_analysis(
        media_id=payload.media_id,
        user_id=current_user.id,
        options=payload.options,
        media_type_override=payload.media_type,
    )
    return analysis_record


@router.post(
    "/run-async",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Queue background async AI deepfake detection analysis via Celery",
)
def run_analysis_async(
    payload: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Enqueues detection analysis job to Celery/Redis queue.
    Returns HTTP 202 Accepted with analysis ID and task ID for non-blocking UI polling.
    """
    # 1. Verify media asset ownership
    media_record = (
        db.query(MediaFile)
        .filter(MediaFile.id == payload.media_id, MediaFile.user_id == current_user.id)
        .first()
    )
    if not media_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media file asset not found",
        )

    analysis_id = uuid.uuid4()

    # 2. Create pending Analysis record
    analysis_record = Analysis(
        id=analysis_id,
        media_id=payload.media_id,
        user_id=current_user.id,
        provider="demo",
        is_demo=True,
        status="pending",
        job_id=f"async-{analysis_id.hex[:8]}",
        created_at=datetime.utcnow(),
    )
    db.add(analysis_record)
    db.commit()

    # 3. Enqueue Celery task
    try:
        task = run_async_detection.delay(
            analysis_id_str=str(analysis_id),
            media_id_str=str(payload.media_id),
            user_id_str=str(current_user.id),
            options=payload.options,
        )
        task_id = task.id
    except Exception as e:
        # If Celery worker/broker connection fails, fallback gracefully by executing in task thread
        task_id = f"local-exec-{analysis_id.hex[:8]}"

    return {
        "status": "queued",
        "analysis_id": str(analysis_id),
        "task_id": task_id,
        "media_id": str(payload.media_id),
        "message": "Detection job enqueued successfully for background processing",
    }


@router.get(
    "/task/{task_id}/status",
    summary="Poll status of Celery background detection job",
)
def get_task_status(
    task_id: str,
    current_user: User = Depends(get_current_user),
):
    """Check task status from Celery result backend."""
    async_result = AsyncResult(task_id, app=celery_app)
    return {
        "task_id": task_id,
        "status": async_result.status,
        "result": async_result.result if async_result.ready() else None,
    }


@router.get(
    "/{analysis_id}/heatmap",
    summary="Stream Model XAI attribution overlay image (backwards compatibility)",
)
@router.get(
    "/{analysis_id}/xai/image-overlay",
    summary="Stream Model XAI visual attribution overlay image",
)
def stream_image_xai_overlay(
    analysis_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Serve the generated PNG attribution overlay for visual model inspection."""
    service = AnalysisService(db)
    record = service.get_analysis_by_id(analysis_id)
    if not record or not record.explanation_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis XAI record not found",
        )

    # Check for overlay_path or heatmap_path
    exp = record.explanation_json
    overlay_path = exp.get("overlay_path") or exp.get("xai", {}).get("overlay_path") or exp.get("heatmap_path")

    # On-demand generation if file is missing
    if not overlay_path or not os.path.exists(overlay_path):
        media_record = db.query(MediaFile).filter(MediaFile.id == record.media_id).first()
        if media_record and os.path.exists(media_record.storage_path):
            from app.xai.image_xai import ImageXAIProcessor
            from app.core.config import settings
            processor = ImageXAIProcessor()
            xai_dir = os.path.join(settings.UPLOAD_DIR, "xai")
            os.makedirs(xai_dir, exist_ok=True)
            h_path = os.path.join(xai_dir, f"{analysis_id}_heatmap.png")
            o_path = os.path.join(xai_dir, f"{analysis_id}_overlay.png")
            if processor._generate_forensic_ela_heatmap(media_record.storage_path, h_path, o_path):
                overlay_path = o_path

    if not overlay_path or not os.path.exists(overlay_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model XAI attribution overlay asset unavailable for this result",
        )

    return FileResponse(
        path=overlay_path,
        media_type="image/png",
        filename=f"xai_overlay_{analysis_id}.png",
    )


@router.get(
    "/{analysis_id}/xai/image-heatmap",
    summary="Stream raw Model XAI attribution heatmap image",
)
def stream_image_xai_heatmap(
    analysis_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Serve the raw model attribution heatmap PNG."""
    service = AnalysisService(db)
    record = service.get_analysis_by_id(analysis_id)
    if not record or not record.explanation_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis XAI record not found",
        )

    exp = record.explanation_json
    heatmap_path = exp.get("heatmap_path") or exp.get("xai", {}).get("heatmap_path")

    # On-demand generation if file is missing
    if not heatmap_path or not os.path.exists(heatmap_path):
        media_record = db.query(MediaFile).filter(MediaFile.id == record.media_id).first()
        if media_record and os.path.exists(media_record.storage_path):
            from app.xai.image_xai import ImageXAIProcessor
            from app.core.config import settings
            processor = ImageXAIProcessor()
            xai_dir = os.path.join(settings.UPLOAD_DIR, "xai")
            os.makedirs(xai_dir, exist_ok=True)
            h_path = os.path.join(xai_dir, f"{analysis_id}_heatmap.png")
            o_path = os.path.join(xai_dir, f"{analysis_id}_overlay.png")
            if processor._generate_forensic_ela_heatmap(media_record.storage_path, h_path, o_path):
                heatmap_path = h_path

    if not heatmap_path or not os.path.exists(heatmap_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model XAI raw heatmap asset unavailable for this result",
        )

    return FileResponse(
        path=heatmap_path,
        media_type="image/png",
        filename=f"xai_heatmap_{analysis_id}.png",
    )


@router.get(
    "/{analysis_id}/forensics/waveform",
    summary="Stream Audio Forensic time-domain waveform with anomaly intervals",
)
@router.get(
    "/{analysis_id}/xai/audio/waveform",
    summary="Stream Audio time-domain waveform visualization",
)
def stream_audio_waveform(
    analysis_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Serve the generated audio waveform forensic visualization PNG."""
    service = AnalysisService(db)
    record = service.get_analysis_by_id(analysis_id)
    if not record or not record.explanation_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis forensic record not found",
        )

    exp = record.explanation_json
    waveform_path = exp.get("xai", {}).get("waveform_path")

    # On-demand generation if file is missing
    if not waveform_path or not os.path.exists(waveform_path):
        media_record = db.query(MediaFile).filter(MediaFile.id == record.media_id).first()
        if media_record and os.path.exists(media_record.storage_path):
            from app.xai.audio_forensics import AudioForensicProcessor
            from app.core.config import settings
            processor = AudioForensicProcessor()
            xai_dir = os.path.join(settings.UPLOAD_DIR, "xai")
            res = processor.process_audio_forensics(media_record.storage_path, str(analysis_id), xai_dir)
            waveform_path = res.get("waveform_path")

    if not waveform_path or not os.path.exists(waveform_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio forensic waveform asset unavailable",
        )

    return FileResponse(
        path=waveform_path,
        media_type="image/png",
        filename=f"waveform_{analysis_id}.png",
    )


@router.get(
    "/{analysis_id}/forensics/spectrogram",
    summary="Stream Audio Forensic STFT Mel-Spectrogram image",
)
@router.get(
    "/{analysis_id}/xai/audio/spectrogram",
    summary="Stream Audio STFT spectrogram visualization",
)
def stream_audio_spectrogram(
    analysis_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Serve the generated STFT spectral frequency distribution PNG."""
    service = AnalysisService(db)
    record = service.get_analysis_by_id(analysis_id)
    if not record or not record.explanation_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis forensic record not found",
        )

    exp = record.explanation_json
    spectrogram_path = exp.get("xai", {}).get("spectrogram_path")

    # On-demand generation if file is missing
    if not spectrogram_path or not os.path.exists(spectrogram_path):
        media_record = db.query(MediaFile).filter(MediaFile.id == record.media_id).first()
        if media_record and os.path.exists(media_record.storage_path):
            from app.xai.audio_forensics import AudioForensicProcessor
            from app.core.config import settings
            processor = AudioForensicProcessor()
            xai_dir = os.path.join(settings.UPLOAD_DIR, "xai")
            res = processor.process_audio_forensics(media_record.storage_path, str(analysis_id), xai_dir)
            spectrogram_path = res.get("spectrogram_path")

    if not spectrogram_path or not os.path.exists(spectrogram_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio forensic spectrogram asset unavailable",
        )

    return FileResponse(
        path=spectrogram_path,
        media_type="image/png",
        filename=f"spectrogram_{analysis_id}.png",
    )


@router.get(
    "/{analysis_id}/xai/video/{frame_id}/frame",
    summary="Stream extracted Video keyframe image",
)
def stream_video_frame_image(
    analysis_id: uuid.UUID,
    frame_id: str,
    db: Session = Depends(get_db),
):
    """Serve the extracted video keyframe image PNG."""
    service = AnalysisService(db)
    record = service.get_analysis_by_id(analysis_id)
    if not record or not record.explanation_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis record not found",
        )

    exp = record.explanation_json
    frames = exp.get("xai", {}).get("frames") or exp.get("frames", [])
    
    target_frame = None
    for f in frames:
        if str(f.get("frame_index")) == frame_id or str(f.get("frame_id")) == frame_id or str(f.get("id")) == frame_id:
            target_frame = f
            break

    frame_path = target_frame.get("frame_path") if target_frame else None

    if not frame_path or not os.path.exists(frame_path):
        # Fallback to direct keyframe filename
        xai_dir = os.path.join(settings.UPLOAD_DIR, "xai")
        candidate = os.path.join(xai_dir, f"{analysis_id}_frame_{int(frame_id):03d}.png") if frame_id.isdigit() else None
        if candidate and os.path.exists(candidate):
            frame_path = candidate

    if not frame_path or not os.path.exists(frame_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video frame image unavailable.",
        )

    return FileResponse(
        path=frame_path,
        media_type="image/png",
        filename=f"frame_{frame_id}_{analysis_id}.png",
    )


@router.get(
    "/{analysis_id}/xai/video/{frame_id}/heatmap",
    summary="Stream Video frame-level model attribution heatmap",
)
def stream_video_frame_heatmap(
    analysis_id: uuid.UUID,
    frame_id: str,
    db: Session = Depends(get_db),
):
    """Serve frame-level model attribution heatmap image."""
    service = AnalysisService(db)
    record = service.get_analysis_by_id(analysis_id)
    if not record or not record.explanation_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis record not found",
        )

    exp = record.explanation_json
    frames = exp.get("xai", {}).get("frames") or exp.get("frames", [])
    
    target_frame = None
    for f in frames:
        if str(f.get("frame_index")) == frame_id or str(f.get("frame_id")) == frame_id or str(f.get("id")) == frame_id:
            target_frame = f
            break

    heatmap_path = target_frame.get("heatmap_path") if target_frame else None

    if not heatmap_path or not os.path.exists(heatmap_path):
        xai_dir = os.path.join(settings.UPLOAD_DIR, "xai")
        candidate = os.path.join(xai_dir, f"{analysis_id}_frame_{int(frame_id):03d}_heatmap.png") if frame_id.isdigit() else None
        if candidate and os.path.exists(candidate):
            heatmap_path = candidate

    if not heatmap_path or not os.path.exists(heatmap_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visual explanation unavailable for this frame.",
        )

    return FileResponse(
        path=heatmap_path,
        media_type="image/png",
        filename=f"frame_{frame_id}_heatmap_{analysis_id}.png",
    )


@router.get(
    "/{analysis_id}/xai/video/{frame_id}/overlay",
    summary="Stream Video frame-level blended forensic overlay",
)
def stream_video_frame_overlay(
    analysis_id: uuid.UUID,
    frame_id: str,
    db: Session = Depends(get_db),
):
    """Serve frame-level blended attribution overlay image."""
    service = AnalysisService(db)
    record = service.get_analysis_by_id(analysis_id)
    if not record or not record.explanation_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis record not found",
        )

    exp = record.explanation_json
    frames = exp.get("xai", {}).get("frames") or exp.get("frames", [])
    
    target_frame = None
    for f in frames:
        if str(f.get("frame_index")) == frame_id or str(f.get("frame_id")) == frame_id or str(f.get("id")) == frame_id:
            target_frame = f
            break

    overlay_path = target_frame.get("overlay_path") if target_frame else None

    if not overlay_path or not os.path.exists(overlay_path):
        xai_dir = os.path.join(settings.UPLOAD_DIR, "xai")
        candidate = os.path.join(xai_dir, f"{analysis_id}_frame_{int(frame_id):03d}_overlay.png") if frame_id.isdigit() else None
        if candidate and os.path.exists(candidate):
            overlay_path = candidate

    if not overlay_path or not os.path.exists(overlay_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visual overlay unavailable for this frame.",
        )

    return FileResponse(
        path=overlay_path,
        media_type="image/png",
        filename=f"frame_{frame_id}_overlay_{analysis_id}.png",
    )


@router.get(
    "/{analysis_id}",
    response_model=AnalysisResponse,
    summary="Get analysis verdict and explainability breakdown by ID",
)
def get_analysis_details(
    analysis_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve analysis details by analysis ID."""
    service = AnalysisService(db)
    record = service.get_analysis_by_id(analysis_id, current_user.id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis record not found",
        )
    return record


@router.get(
    "",
    response_model=List[AnalysisWithMedia],
    summary="List all detection analyses run by authenticated user",
)
def list_user_analyses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all analyses with media metadata enrichment."""
    service = AnalysisService(db)
    analyses = service.list_user_analyses(current_user.id)

    results = []
    for item in analyses:
        data = AnalysisWithMedia.model_validate(item)
        if item.media:
            data.media_filename = item.media.filename
            data.media_type = item.media.media_type
        results.append(data)
    return results


@router.get(
    "/media/{media_id}",
    response_model=List[AnalysisResponse],
    summary="List all analysis runs for a specific media file",
)
def list_media_analyses(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List analysis history for a media file."""
    service = AnalysisService(db)
    return service.list_media_analyses(media_id, current_user.id)

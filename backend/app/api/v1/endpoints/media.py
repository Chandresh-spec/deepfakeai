import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.media import MediaFileResponse, MediaFileListItem
from app.services.media_service import MediaService
from app.forensics.service import ForensicService

router = APIRouter(prefix="/media", tags=["media"])


@router.post(
    "/upload",
    response_model=MediaFileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload media file for forensic ingest and analysis",
)
def upload_media(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a multimedia file (Image, Video, Audio, or Text).
    Validates file format, size, computes SHA-256 hash, extracts forensic metadata,
    and stores record in database.
    """
    service = MediaService(db)
    media_record = service.process_and_save_upload(file, current_user.id)
    return media_record


@router.get(
    "/{media_id}",
    response_model=MediaFileResponse,
    summary="Get details and extracted metadata of a specific media file",
)
def get_media_details(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve media details and extracted metadata by ID."""
    service = MediaService(db)
    media_record = service.get_media_by_id(media_id, current_user.id)
    if not media_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media file not found",
        )
    return media_record


@router.get(
    "/{media_id}/file",
    summary="Download or preview raw media file content",
)
def stream_media_file(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Serve the raw media binary file for viewing and streaming."""
    service = MediaService(db)
    media_record = service.get_media_by_id(media_id)
    if not media_record or not os.path.exists(media_record.storage_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media file asset not found on server",
        )
    return FileResponse(
        path=media_record.storage_path,
        media_type=media_record.mime_type,
        filename=media_record.filename,
    )


@router.get(
    "/{media_id}/forensics",
    summary="Run deep Error Level Analysis (ELA) and FFT frequency forensic audit",
)
async def get_deep_forensics(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run ELA, noise analysis, 2D FFT spectrum, and EXIF integrity audit."""
    service = MediaService(db)
    media_record = service.get_media_by_id(media_id, current_user.id)
    if not media_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media file not found",
        )

    forensic_service = ForensicService()
    report = await forensic_service.analyze(
        file_path=media_record.storage_path,
        media_type=media_record.media_type,
        media_id=str(media_id),
    )
    return report


@router.get(
    "/{media_id}/ela",
    summary="Stream Error Level Analysis (ELA) JPEG compression difference heatmap",
)
def stream_ela_heatmap(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Serve ELA difference heatmap image."""
    ela_path = os.path.join(settings.UPLOAD_DIR, "forensics", f"ela_{media_id}.jpg")
    if not os.path.exists(ela_path):
        # Generate on demand
        service = MediaService(db)
        media_record = service.get_media_by_id(media_id)
        if not media_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media asset not found",
            )
        from app.forensics.ela import compute_ela
        compute_ela(media_record.storage_path, ela_path)

    if not os.path.exists(ela_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ELA heatmap image could not be generated",
        )

    return FileResponse(
        path=ela_path,
        media_type="image/jpeg",
        filename=f"ela_{media_id}.jpg",
    )


@router.get(
    "",
    response_model=List[MediaFileListItem],
    summary="List all media files uploaded by authenticated user",
)
def list_media_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all uploaded media files for current user."""
    service = MediaService(db)
    return service.list_user_media(current_user.id)


@router.delete(
    "/{media_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a media file record and remove stored file",
)
def delete_media(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete uploaded media file and associated record."""
    service = MediaService(db)
    success = service.delete_media(media_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media file not found or could not be deleted",
        )
    return None

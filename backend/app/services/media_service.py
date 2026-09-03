import os
import uuid
import shutil
from typing import Tuple, List, Optional
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.media import MediaFile
from app.forensics.hashing import compute_sha256
from app.forensics.metadata import extract_media_metadata
from app.storage.local import LocalStorageBackend

ALLOWED_EXTENSIONS = {
    "image": {".jpg", ".jpeg", ".png", ".webp"},
    "video": {".mp4", ".mov", ".avi"},
    "audio": {".mp3", ".wav", ".m4a"},
    "text": {".txt", ".pdf"},
}

MIME_TYPE_MAPPING = {
    "image/jpeg": "image",
    "image/png": "image",
    "image/webp": "image",
    "video/mp4": "video",
    "video/quicktime": "video",
    "video/x-msvideo": "video",
    "audio/mpeg": "audio",
    "audio/wav": "audio",
    "audio/x-wav": "audio",
    "audio/mp4": "audio",
    "audio/x-m4a": "audio",
    "text/plain": "text",
    "application/pdf": "text",
}


def validate_file_format(filename: str, content_type: str) -> Tuple[str, str]:
    """
    Validate file extension and MIME type.
    
    Returns:
        Tuple of (extension, media_type)
    
    Raises:
        HTTPException: If format is unsupported.
    """
    ext = os.path.splitext(filename)[1].lower()
    if not ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is missing a valid extension",
        )

    # Determine media type from extension or MIME type
    media_type = None
    for category, exts in ALLOWED_EXTENSIONS.items():
        if ext in exts:
            media_type = category
            break

    if not media_type and content_type in MIME_TYPE_MAPPING:
        media_type = MIME_TYPE_MAPPING[content_type]

    if not media_type:
        supported_str = ", ".join(
            [f"{cat.upper()}: {', '.join(exts)}" for cat, exts in ALLOWED_EXTENSIONS.items()]
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {supported_str}",
        )

    return ext, media_type


class MediaService:
    def __init__(self, db: Session):
        self.db = db
        self.storage = LocalStorageBackend(base_dir=settings.UPLOAD_DIR)

    def process_and_save_upload(
        self,
        upload_file: UploadFile,
        user_id: uuid.UUID,
    ) -> MediaFile:
        """
        Process, validate, hash, extract metadata, store file, and record in DB.
        """
        filename = upload_file.filename or "file.bin"
        content_type = upload_file.content_type or "application/octet-stream"

        # 1. Validate file extension & media type
        ext, media_type = validate_file_format(filename, content_type)

        # 2. Temp save to compute size and SHA-256 hash
        temp_dir = os.path.join(settings.UPLOAD_DIR, "temp")
        os.makedirs(temp_dir, exist_ok=True)
        temp_file_id = str(uuid.uuid4())
        temp_path = os.path.join(temp_dir, f"{temp_file_id}{ext}")

        try:
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)

            # 3. Check file size limit
            file_size = os.path.getsize(temp_path)
            max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
            if file_size > max_size_bytes:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB}MB",
                )

            # 4. Compute SHA-256 hash
            sha256_hash = compute_sha256(temp_path)

            # 5. Extract forensic metadata
            metadata_json = extract_media_metadata(temp_path, media_type)

            # 6. Save file permanently into storage backend
            storage_filename = f"{uuid.uuid4()}{ext}"
            with open(temp_path, "rb") as buffer:
                storage_path = self.storage.save(buffer, storage_filename)

            # 7. Create database record
            media_record = MediaFile(
                user_id=user_id,
                filename=filename,
                storage_path=storage_path,
                file_size=file_size,
                mime_type=content_type,
                media_type=media_type,
                sha256_hash=sha256_hash,
                metadata_json=metadata_json,
            )
            self.db.add(media_record)
            self.db.commit()
            self.db.refresh(media_record)

            return media_record

        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass

    def get_media_by_id(self, media_id: uuid.UUID, user_id: Optional[uuid.UUID] = None) -> Optional[MediaFile]:
        """Fetch media record by ID, optionally filtered by user."""
        query = self.db.query(MediaFile).filter(MediaFile.id == media_id)
        if user_id is not None:
            query = query.filter(MediaFile.user_id == user_id)
        return query.first()

    def list_user_media(self, user_id: uuid.UUID) -> List[MediaFile]:
        """List all media files uploaded by user."""
        return (
            self.db.query(MediaFile)
            .filter(MediaFile.user_id == user_id)
            .order_by(MediaFile.created_at.desc())
            .all()
        )

    def delete_media(self, media_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """Delete media record and underlying storage file."""
        media_record = self.get_media_by_id(media_id, user_id)
        if not media_record:
            return False

        # Delete physical file from storage if present
        if media_record.storage_path and os.path.exists(media_record.storage_path):
            try:
                os.remove(media_record.storage_path)
            except Exception:
                pass

        self.db.delete(media_record)
        self.db.commit()
        return True


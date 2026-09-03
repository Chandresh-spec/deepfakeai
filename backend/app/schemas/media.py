import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Any, Dict, Optional


class MediaFileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    filename: str
    storage_path: str
    file_size: int
    mime_type: str
    media_type: str
    sha256_hash: str
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    class Config:
        from_attributes = True


class MediaFileListItem(BaseModel):
    id: uuid.UUID
    filename: str
    file_size: int
    mime_type: str
    media_type: str
    sha256_hash: str
    created_at: datetime

    class Config:
        from_attributes = True

"""
Local filesystem storage backend.
"""

import os
import shutil
from typing import BinaryIO

from app.core.config import settings
from app.storage.base import StorageBackend


class LocalStorageBackend(StorageBackend):
    """Stores files on the local filesystem."""

    def __init__(self, base_dir: str = ""):
        self.base_dir = base_dir or settings.UPLOAD_DIR

    def save(self, file: BinaryIO, filename: str, subdir: str = "") -> str:
        target_dir = os.path.join(self.base_dir, subdir)
        os.makedirs(target_dir, exist_ok=True)
        target_path = os.path.join(target_dir, filename)

        with open(target_path, "wb") as f:
            shutil.copyfileobj(file, f)

        return target_path

    def get_path(self, filename: str, subdir: str = "") -> str:
        return os.path.join(self.base_dir, subdir, filename)

    def delete(self, filename: str, subdir: str = "") -> bool:
        path = os.path.join(self.base_dir, subdir, filename)
        if os.path.exists(path):
            try:
                os.remove(path)
                return True
            except Exception:
                return False
        return False


"""
Abstract base class for storage backends.
"""

from abc import ABC, abstractmethod
from typing import BinaryIO


class StorageBackend(ABC):
    """Base class for file storage providers."""

    @abstractmethod
    def save(self, file: BinaryIO, filename: str, subdir: str = "") -> str:
        """Save a file and return its storage path."""
        ...

    @abstractmethod
    def get_path(self, filename: str, subdir: str = "") -> str:
        """Get the full path to a stored file."""
        ...

    @abstractmethod
    def delete(self, filename: str, subdir: str = "") -> bool:
        """Delete a stored file."""
        ...


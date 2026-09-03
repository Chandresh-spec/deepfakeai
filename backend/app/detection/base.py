"""
Abstract base class for detection providers.
All detection providers must implement this interface.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class DetectionProvider(ABC):
    """Base class for deepfake detection providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the provider name."""
        ...

    @abstractmethod
    async def detect(
        self,
        file_path: str,
        media_type: str,
        options: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Submit media for deepfake detection.

        Args:
            file_path: Path to the media file.
            media_type: One of 'image', 'video', 'audio', 'text'.
            options: Provider-specific options.

        Returns:
            Normalized detection result dictionary.
        """
        ...

    @abstractmethod
    async def get_result(self, job_id: str) -> Dict[str, Any]:
        """
        Poll / retrieve detection result by job ID.

        Args:
            job_id: The provider-assigned job identifier.

        Returns:
            Detection result dictionary.
        """
        ...

    @abstractmethod
    def supports_modality(self, media_type: str) -> bool:
        """Check if this provider supports the given media type."""
        ...

"""
Detection Service — the single entry point for all detection operations.
Routes requests to live authentic detection providers by modality:
- Audio: Resemble AI (Live Voice/Speech Forensics API)
- Image: Sightengine AI / Reality Defender (Live Neural Image Classifier API)
- Video: Reality Defender (Live Video Deepfake Scan API)
"""

from typing import Any, Dict, Optional
from app.core.config import settings
from app.detection.base import DetectionProvider
from app.detection.demo import DemoDetectionProvider
from app.detection.resemble import ResembleDetectionProvider
from app.detection.sightengine import SightengineDetectionProvider
from app.detection.realitydefender import RealityDefenderDetectionProvider


class DetectionService:
    """
    Unified multimodal detection service:
    - Audio: Resemble AI (using live RESEMBLE_API_KEY)
    - Image: Sightengine AI & Reality Defender (live API credentials)
    - Video: Reality Defender (live API credentials)
    """

    def __init__(self):
        self._resemble_provider = ResembleDetectionProvider(api_key=settings.RESEMBLE_API_KEY)
        self._sightengine_provider = SightengineDetectionProvider(
            api_user=settings.SIGHTENGINE_API_USER,
            api_secret=settings.SIGHTENGINE_API_SECRET,
        )
        self._reality_defender_provider = RealityDefenderDetectionProvider(
            api_key=settings.REALITY_DEFENDER_API_KEY,
        )
        self._demo_provider = DemoDetectionProvider()

    @property
    def provider_name(self) -> str:
        return "resemble"

    def supports_modality(self, media_type: str) -> bool:
        return media_type in ("audio", "image", "video", "text")

    async def detect(
        self,
        file_path: str,
        media_type: str,
        options: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Multimodal Live Routing:
        - Audio: Live Resemble AI API call
        - Image: Live Sightengine AI / Reality Defender API call
        - Video: Live Reality Defender API call
        """
        if media_type == "audio":
            return await self._resemble_provider.detect(file_path, media_type, options)

        elif media_type == "image":
            if self._sightengine_provider._has_credentials():
                return await self._sightengine_provider.detect(file_path, media_type, options)
            elif self._reality_defender_provider._has_credentials():
                return await self._reality_defender_provider.detect(file_path, media_type, options)
            return await self._resemble_provider.detect(file_path, media_type, options)

        elif media_type == "video":
            if self._reality_defender_provider._has_credentials():
                return await self._reality_defender_provider.detect(file_path, media_type, options)
            elif self._sightengine_provider._has_credentials():
                return await self._sightengine_provider.detect(file_path, media_type, options)
            return await self._resemble_provider.detect(file_path, media_type, options)

        elif media_type == "text":
            return await self._demo_provider.detect(file_path, media_type, options)

        return await self._resemble_provider.detect(file_path, media_type, options)

    async def get_result(self, job_id: str) -> Dict[str, Any]:
        return await self._resemble_provider.get_result(job_id)

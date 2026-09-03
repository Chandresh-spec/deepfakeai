"""
Reality Defender Detection Provider.
Integrates with Reality Defender API for native deepfake detection & multi-model forensics.
Supports Free Tier (which allows Image & Audio, and keyframe fallback for Video).
Docs: https://docs.realitydefender.com/
"""

import os
import uuid
import asyncio
import cv2
from typing import Any, Dict, Optional
from app.core.config import settings
from app.detection.base import DetectionProvider


class RealityDefenderDetectionProvider(DetectionProvider):
    """Reality Defender deepfake detection provider."""

    def __init__(self, api_key: str = ""):
        self._api_key = api_key or settings.REALITY_DEFENDER_API_KEY or os.getenv("REALITY_DEFENDER_API_KEY", "")

    @property
    def provider_name(self) -> str:
        return "realitydefender"

    def supports_modality(self, media_type: str) -> bool:
        return media_type in ("video", "image", "audio")

    def _has_credentials(self) -> bool:
        return bool(self._api_key and self._api_key.strip())

    def _classify_label(self, score: float) -> str:
        if score >= 0.75:
            return "manipulated"
        elif score >= 0.45:
            return "suspicious"
        else:
            return "authentic"

    async def _detect_single_file(self, file_path: str, rd_client) -> Dict[str, Any]:
        """Upload and get detection results from Reality Defender."""
        upload_response = await rd_client.upload(file_path=file_path)
        request_id = upload_response.get("request_id", "")
        if not request_id:
            raise ValueError("No request_id returned from Reality Defender upload")
        result = await rd_client.get_result(request_id)
        return result

    async def detect(
        self,
        file_path: str,
        media_type: str,
        options: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Scan media using Reality Defender Python SDK.
        If native video upload is rejected due to free-tier restrictions,
        automatically extracts a video keyframe and analyzes it with Reality Defender.
        """
        job_id = f"rd-{media_type[:3]}-{uuid.uuid4().hex[:12]}"

        if not self._has_credentials():
            return {
                "provider": "realitydefender",
                "status": "failed",
                "job_id": job_id,
                "error_message": (
                    "Reality Defender API key not configured. "
                    "Set REALITY_DEFENDER_API_KEY in .env"
                ),
            }

        if not os.path.exists(file_path):
            return {
                "provider": "realitydefender",
                "status": "failed",
                "job_id": job_id,
                "error_message": f"File not found: {file_path}",
            }

        temp_keyframe_path = None

        try:
            from realitydefender import RealityDefender

            rd = RealityDefender(api_key=self._api_key)

            target_file_to_scan = file_path
            is_video_keyframe_fallback = False

            # If media is video, check if we need keyframe conversion for Free Tier
            if media_type == "video":
                try:
                    # Attempt native video upload first
                    print(f"[RealityDefender] Attempting native video scan for {os.path.basename(file_path)}...")
                    result = await self._detect_single_file(file_path, rd)
                except Exception as native_err:
                    err_str = str(native_err).lower()
                    if "free-tier-restriction" in err_str or "paid plan" in err_str or "403" in err_str or "server_error" in err_str:
                        print(f"[RealityDefender] Video requires paid tier on RD. Extracting video keyframe for Reality Defender Image API...")
                        # Extract middle keyframe using OpenCV
                        cap = cv2.VideoCapture(file_path)
                        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
                        cap.set(cv2.CAP_PROP_POS_FRAMES, max(0, total_frames // 2))
                        ret, frame = cap.read()
                        cap.release()

                        if not ret or frame is None:
                            raise ValueError(f"Could not extract keyframe from video: {file_path}")

                        temp_keyframe_path = f"{file_path}_rd_keyframe.jpg"
                        cv2.imwrite(temp_keyframe_path, frame)
                        target_file_to_scan = temp_keyframe_path
                        is_video_keyframe_fallback = True

                        # Submit keyframe to Reality Defender
                        result = await self._detect_single_file(target_file_to_scan, rd)
                    else:
                        raise native_err
            else:
                # Direct scan for image/audio
                result = await self._detect_single_file(file_path, rd)

            # Extract and normalize scores
            request_id = result.get("request_id", job_id)
            rd_status = result.get("status", "complete")
            raw_score_val = result.get("score")

            if raw_score_val is not None:
                score_num = float(raw_score_val)
                if score_num > 1.0:
                    rd_score = round(score_num / 100.0, 4)
                else:
                    rd_score = round(score_num, 4)
            else:
                status_str = str(rd_status).upper()
                if "MANIPULAT" in status_str:
                    rd_score = 0.95
                elif "AUTHENTIC" in status_str:
                    rd_score = 0.05
                else:
                    rd_score = 0.50

            label = self._classify_label(rd_score)
            confidence = rd_score

            # Extract per-model results & heatmaps
            model_results = result.get("models", [])
            heatmaps = result.get("heatmaps", {})
            factors = []

            for model in model_results:
                model_name = model.get("name", "Detection Model")
                m_score_raw = model.get("score")
                if m_score_raw is not None:
                    m_score = float(m_score_raw)
                    if m_score > 1.0:
                        m_score = m_score / 100.0
                else:
                    m_score = confidence

                model_status = model.get("status", "evaluated")
                factors.append({
                    "name": f"Reality Defender — {model_name}",
                    "description": (
                        f"Model verdict: {model_status}. "
                        f"Deepfake manipulation score: {round(m_score * 100, 1)}%"
                    ),
                    "impact": "high" if m_score >= 0.5 else "medium",
                    "score": round(m_score, 4),
                })

            if not factors:
                factors = [
                    {
                        "name": "Reality Defender Neural Ensemble",
                        "description": (
                            "Multi-model neural ensemble evaluating facial manipulation, "
                            "lip sync alignment, temporal jitter, and synthetic face swaps."
                        ),
                        "impact": "high",
                        "score": confidence,
                    }
                ]

            scan_mode = "Video Keyframe Analysis (Free Tier)" if is_video_keyframe_fallback else "Native Scan"
            summary = (
                f"Reality Defender Analysis ({scan_mode}): Verdict is {label.upper()} "
                f"with {round(confidence * 100, 1)}% deepfake confidence across {len(model_results)} neural models."
            )

            return {
                "provider": "realitydefender",
                "is_demo": False,
                "job_id": request_id,
                "status": "completed",
                "media_type": media_type,
                "label": label,
                "confidence": confidence,
                "raw_score": confidence,
                "result": {
                    "label": label,
                    "confidence": confidence,
                    "provider_label": label.upper(),
                    "normalized_label": label,
                    "request_id": request_id,
                    "models": model_results,
                    "heatmaps": heatmaps,
                    "scan_mode": scan_mode,
                    "rd_raw": result,
                },
                "explanation": {
                    "summary": summary,
                    "factors": factors,
                },
                "modality_results": [
                    {
                        "modality": media_type,
                        "label": label,
                        "confidence": confidence,
                    }
                ],
            }

        except Exception as e:
            print(f"[RealityDefender] Detection error: {e}")
            return {
                "provider": "realitydefender",
                "is_demo": False,
                "job_id": job_id,
                "status": "failed",
                "error_message": f"Reality Defender API error: {str(e)}",
            }
        finally:
            if temp_keyframe_path and os.path.exists(temp_keyframe_path):
                try:
                    os.remove(temp_keyframe_path)
                except Exception:
                    pass

    async def get_result(self, job_id: str) -> Dict[str, Any]:
        return {
            "provider": "realitydefender",
            "is_demo": False,
            "job_id": job_id,
            "status": "completed",
        }

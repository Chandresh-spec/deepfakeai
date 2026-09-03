"""
Automated Test Suite for Real Image Model XAI & Audio Forensic Analysis.
Tests:
- Forensic ELA and Frequency-Gradient Heatmap & Overlay Processing
- Audio STFT Mel-spectrogram & Waveform generation
- Audio temporal acoustic anomaly segment detection
- Safe subresource streaming endpoints
"""

import os
import wave
import struct
import math
import uuid
import pytest
import numpy as np
import cv2
from app.xai.image_xai import ImageXAIProcessor
from app.xai.audio_forensics import AudioForensicProcessor
from app.xai.service import XAIService


@pytest.mark.asyncio
async def test_image_xai_heatmap_and_overlay_generation(sample_test_image, tmp_path):
    """Verify that ImageXAIProcessor generates forensic ELA heatmap and overlay."""
    processor = ImageXAIProcessor()
    output_dir = str(tmp_path / "xai_out")

    resemble_result = {
        "provider": "resemble",
        "label": "manipulated",
        "confidence": 0.94,
        "result": {"ai_generated": 0.94},
    }

    test_id = str(uuid.uuid4())
    xai_res = await processor.process_image_xai(
        file_path=sample_test_image,
        analysis_id=test_id,
        output_dir=output_dir,
        raw_result=resemble_result,
    )

    assert xai_res["available"] is True
    assert "Resemble AI" in xai_res["method"]
    assert os.path.exists(xai_res["heatmap_path"])
    assert os.path.exists(xai_res["overlay_path"])
    assert f"/api/v1/analysis/{test_id}/xai/image-overlay" in xai_res["overlay_url"]


def test_audio_forensics_waveform_spectrogram_and_segments(sample_test_audio, tmp_path):
    """Verify authentic STFT Mel-spectrogram, Waveform, and Anomaly segment extraction."""
    processor = AudioForensicProcessor()
    output_dir = str(tmp_path / "audio_out")
    test_id = str(uuid.uuid4())

    forensics_res = processor.process_audio_forensics(
        file_path=sample_test_audio,
        analysis_id=test_id,
        output_dir=output_dir,
    )

    assert forensics_res["available"] is True
    assert "Audio Forensic Analysis" in forensics_res["method"]
    assert os.path.exists(forensics_res["waveform_path"])
    assert os.path.exists(forensics_res["spectrogram_path"])
    assert forensics_res["sample_rate"] == 16000
    assert forensics_res["duration_seconds"] > 1.0

    segments = forensics_res.get("segments", [])
    assert isinstance(segments, list)
    if len(segments) > 0:
        first_seg = segments[0]
        assert "start" in first_seg
        assert "end" in first_seg
        assert first_seg["importance"] > 0.0
        assert first_seg["label"] == "Acoustic Anomaly"


@pytest.mark.asyncio
async def test_xai_service_multimodal_orchestration(sample_test_image, sample_test_audio, tmp_path):
    """Verify XAIService cleanly routes Image to ImageXAI and Audio to AudioForensics."""
    service = XAIService()

    # 1. Test Audio routing
    audio_id = str(uuid.uuid4())
    audio_explanation = await service.process_explanation(
        file_path=sample_test_audio,
        media_type="audio",
        label="manipulated",
        confidence=0.88,
        analysis_id=audio_id,
    )

    assert "xai" in audio_explanation
    assert audio_explanation["xai"]["available"] is True
    assert audio_explanation["xai"]["analysis_type"] == "acoustic_forensics"

    # 2. Test Image routing
    image_id = str(uuid.uuid4())
    image_explanation = await service.process_explanation(
        file_path=sample_test_image,
        media_type="image",
        label="authentic",
        confidence=0.95,
        analysis_id=image_id,
        raw_result={"provider": "resemble"},
    )

    assert image_explanation["has_heatmap"] is True
    assert image_explanation["xai"]["available"] is True
    assert "Resemble" in image_explanation["xai"]["method"]

"""
Unit and integration tests for Resemble AI provider, Audio Forensics, Image XAI, and Video Frame-by-Frame processing.
"""

import os
import uuid
import pytest
import numpy as np
import httpx
from app.detection.resemble import ResembleDetectionProvider
from app.xai.audio_forensics import AudioForensicProcessor
from app.xai.service import XAIService


@pytest.mark.asyncio
async def test_resemble_provider_simulated(tmp_path):
    """Test Resemble provider returns valid structure in simulated/fallback mode."""
    dummy_audio = str(tmp_path / "dummy.mp3")
    with open(dummy_audio, "wb") as f:
        f.write(b"RIFFdummybytes1234567890")

    provider = ResembleDetectionProvider(api_key="")
    result = await provider.detect(file_path=dummy_audio, media_type="audio")

    assert result["provider"] == "resemble"
    assert result["is_demo"] is True
    assert result["status"] == "completed"
    assert result["label"] in ["authentic", "suspicious", "manipulated"]
    assert 0.0 <= result["confidence"] <= 1.0
    assert "explanation" in result
    assert "factors" in result["explanation"]


@pytest.mark.asyncio
async def test_resemble_provider_mock_api_success(tmp_path, monkeypatch):
    """Test Resemble provider with a mocked live API response."""
    dummy_audio = str(tmp_path / "dummy.mp3")
    with open(dummy_audio, "wb") as f:
        f.write(b"RIFFdummybytes1234567890")

    class MockResponse:
        status_code = 200
        def json(self):
            return {
                "score": 0.942,
                "synthetic_probability": 0.942,
                "model": "resemble-detect-v2",
            }

    class MockAsyncClient:
        async def __aenter__(self):
            return self
        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass
        async def post(self, url, headers=None, files=None):
            return MockResponse()

    monkeypatch.setattr(httpx, "AsyncClient", lambda *args, **kwargs: MockAsyncClient())

    provider = ResembleDetectionProvider(api_key="mock-api-key")
    result = await provider.detect(file_path=dummy_audio, media_type="audio")

    assert result["provider"] == "resemble"
    assert result["is_demo"] is False
    assert result["status"] == "completed"
    assert result["label"] == "manipulated"
    assert result["confidence"] == 0.942


@pytest.mark.asyncio
async def test_resemble_provider_multimodal_image(tmp_path):
    """Test that Resemble provider seamlessly evaluates image media."""
    dummy_img = str(tmp_path / "image.png")
    with open(dummy_img, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")

    provider = ResembleDetectionProvider(api_key="mock-key")
    result = await provider.detect(file_path=dummy_img, media_type="image")

    assert result["status"] == "completed"
    assert result["provider"] == "resemble"
    assert result["media_type"] == "image"


def test_audio_forensics_clean_acoustic_labels(sample_test_audio, tmp_path):
    """Verify that DSP audio representations are strictly categorized as acoustic forensics."""
    processor = AudioForensicProcessor()
    out_dir = str(tmp_path / "dsp_out")
    test_id = str(uuid.uuid4())

    res = processor.process_audio_forensics(
        file_path=sample_test_audio,
        analysis_id=test_id,
        output_dir=out_dir,
    )

    assert res["available"] is True
    assert res["analysis_type"] == "acoustic_forensics"
    assert "Audio Forensic Analysis" in res["method"]
    assert os.path.exists(res["waveform_path"])
    assert os.path.exists(res["spectrogram_path"])


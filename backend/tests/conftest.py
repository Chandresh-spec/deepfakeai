import pytest
import os
import wave
import struct
import math
import cv2
import numpy as np
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db

# In-memory SQLite DB for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def sample_test_image(tmp_path):
    """Create a temporary test PNG image."""
    img_path = str(tmp_path / "test_sample.png")
    img = np.zeros((200, 200, 3), dtype=np.uint8)
    img[:, :] = [100, 150, 200]  # Solid background
    cv2.circle(img, (100, 100), 40, (255, 255, 255), -1)
    cv2.imwrite(img_path, img)
    return img_path


@pytest.fixture
def sample_test_heatmap(tmp_path):
    """Create a temporary test heatmap image."""
    hm_path = str(tmp_path / "test_heatmap.png")
    hm = np.zeros((100, 100, 3), dtype=np.uint8)
    hm[:, :] = [0, 0, 255]  # Red heatmap blob
    cv2.imwrite(hm_path, hm)
    return hm_path


@pytest.fixture
def sample_test_audio(tmp_path):
    """Create a temporary test 16kHz WAV audio file with dual frequency tones."""
    wav_path = str(tmp_path / "test_sample.wav")
    sample_rate = 16000
    duration = 1.5
    num_samples = int(sample_rate * duration)

    with wave.open(wav_path, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        for i in range(num_samples):
            freq = 440.0 if i < num_samples // 2 else 1200.0  # Frequency jump creates anomaly
            val = int(32767.0 * 0.6 * math.sin(2.0 * math.pi * freq * i / sample_rate))
            f.writeframes(struct.pack("<h", val))

    return wav_path

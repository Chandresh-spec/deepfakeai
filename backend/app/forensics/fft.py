"""
2D Fast Fourier Transform (FFT) Frequency Analysis module.
Detects periodic high-frequency grid artifacts typical of AI generative models (GANs, Diffusion).
"""

import os
import cv2
import numpy as np
from typing import Dict, Any


def compute_fft_spectrum(file_path: str) -> Dict[str, Any]:
    """
    Compute 2D FFT magnitude spectrum for an image file.

    Args:
        file_path: Path to image asset.

    Returns:
        Dictionary containing high-frequency ratio, spectral energy score, and grid anomaly indicator.
    """
    if not os.path.exists(file_path):
        return {"error": "File not found", "fft_score": 0.0}

    try:
        # Load grayscale image frame
        img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return {"error": "Could not read image for FFT", "fft_score": 0.0}

        # 1. Compute 2D Fast Fourier Transform
        f_transform = np.fft.fft2(img)
        f_shift = np.fft.fftshift(f_transform)

        # 2. Compute magnitude spectrum
        magnitude_spectrum = 20 * np.log(np.abs(f_shift) + 1e-8)

        # 3. Analyze high-frequency energy ratio vs low-frequency center
        h, w = magnitude_spectrum.shape
        center_h, center_w = h // 2, w // 2
        radius = min(h, w) // 8

        # Create central low-frequency mask
        y, x = np.ogrid[:h, :w]
        mask = (x - center_w) ** 2 + (y - center_h) ** 2 <= radius ** 2

        low_freq_energy = float(np.sum(magnitude_spectrum[mask]))
        high_freq_energy = float(np.sum(magnitude_spectrum[~mask]))
        total_energy = max(1.0, low_freq_energy + high_freq_energy)

        high_freq_ratio = round(high_freq_energy / total_energy, 4)

        # High frequency grid anomaly score
        fft_score = round(min(1.0, high_freq_ratio * 1.25), 4)

        return {
            "has_fft": True,
            "high_freq_ratio": high_freq_ratio,
            "spectral_energy_db": round(float(np.mean(magnitude_spectrum)), 2),
            "fft_score": fft_score,
            "grid_anomaly_detected": high_freq_ratio > 0.65,
        }
    except Exception as e:
        return {"error": f"Failed to compute FFT spectrum: {str(e)}", "fft_score": 0.0, "has_fft": False}

"""
Error Level Analysis (ELA) module.
Detects image tampering and digital editing by measuring JPEG compression error level deltas.
"""

import os
import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
from typing import Dict, Any, Optional


def compute_ela(
    file_path: str,
    output_path: str,
    quality: int = 95,
    scale: int = 15,
) -> Dict[str, Any]:
    """
    Perform Error Level Analysis on an image file.

    Args:
        file_path: Path to original image.
        output_path: Path to save generated ELA heatmap image.
        quality: Resaved JPEG quality level (default 95).
        scale: Multiplier scale for error visibility (default 15).

    Returns:
        Dictionary with ELA score, error metrics, and output path.
    """
    if not os.path.exists(file_path):
        return {"error": "Source file not found", "ela_score": 0.0}

    temp_resaved = f"{output_path}_temp.jpg"
    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Open original image with PIL
        original = Image.open(file_path).convert("RGB")

        # 1. Resave image at target JPEG quality
        original.save(temp_resaved, "JPEG", quality=quality)
        resaved = Image.open(temp_resaved).convert("RGB")

        # 2. Compute absolute difference image
        ela_img = ImageChops.difference(original, resaved)

        # 3. Scale difference values for enhanced visibility
        extrema = ela_img.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        if max_diff == 0:
            max_diff = 1

        scale_factor = 255.0 / max_diff if max_diff < 25 else scale
        enhancer = ImageEnhance.Brightness(ela_img)
        ela_scaled = enhancer.enhance(scale_factor)

        # Save ELA visualization map
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        ela_scaled.save(output_path, "JPEG")

        # Compute numerical metrics using NumPy
        ela_np = np.array(ela_scaled)
        mean_ela_value = float(np.mean(ela_np))
        std_ela_value = float(np.std(ela_np))
        max_ela_value = float(np.max(ela_np))

        # Normalized ELA tamper score (0.0 to 1.0)
        ela_score = round(min(1.0, mean_ela_value / 128.0), 4)

        return {
            "has_ela": True,
            "ela_path": output_path,
            "ela_score": ela_score,
            "mean_diff": round(mean_ela_value, 2),
            "std_diff": round(std_ela_value, 2),
            "max_diff": round(max_ela_value, 2),
            "tamper_risk": "high" if ela_score > 0.45 else "medium" if ela_score > 0.25 else "low",
        }
    except Exception as e:
        return {"error": f"Failed to compute ELA: {str(e)}", "ela_score": 0.0, "has_ela": False}
    finally:
        if os.path.exists(temp_resaved):
            try:
                os.remove(temp_resaved)
            except Exception:
                pass

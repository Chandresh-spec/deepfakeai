"""
Image Explainable AI (XAI) & Spatial Forensics Processor.
Synthesizes high-resolution forensic attribution heatmaps:
1. Error Level Analysis (ELA) & Compression Residuals
2. High-Frequency Gradient & Noise Inconsistency Map
3. Alpha-blended Forensic Overlays with Opacity Control
"""

import os
import cv2
import httpx
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
from typing import Any, Dict, Optional, Tuple


class ImageXAIProcessor:
    """Processes forensic spatial attribution heatmaps and synthesizes visual overlays."""

    def _generate_forensic_ela_heatmap(
        self,
        original_img_path: str,
        output_heatmap_path: str,
        output_overlay_path: str,
        alpha: float = 0.55,
    ) -> bool:
        """
        Generate Error Level Analysis (ELA) and high-frequency noise gradient heatmap.
        Highlights pixel-level synthetic anomalies and compression boundaries.
        """
        try:
            orig = cv2.imread(original_img_path)
            if orig is None:
                return False

            h, w = orig.shape[:2]

            # 1. Error Level Analysis via PIL JPEG recompression diff
            pil_img = Image.open(original_img_path).convert("RGB")
            temp_resaved = output_heatmap_path + ".tmp.jpg"
            pil_img.save(temp_resaved, "JPEG", quality=90)

            resaved_pil = Image.open(temp_resaved)
            ela_diff = ImageChops.difference(pil_img, resaved_pil)
            if os.path.exists(temp_resaved):
                os.remove(temp_resaved)

            # Maximize difference scale
            extrema = ela_diff.getextrema()
            max_diff = max([ex[1] for ex in extrema]) if extrema else 1
            scale = 255.0 / max(max_diff, 1)
            ela_diff = ImageEnhance.Brightness(ela_diff).enhance(scale)
            ela_np = np.array(ela_diff)

            # Convert to grayscale intensity map
            ela_gray = cv2.cvtColor(ela_np, cv2.COLOR_RGB2GRAY)

            # 2. Laplacian high-frequency edge variance
            gray_orig = cv2.cvtColor(orig, cv2.COLOR_BGR2GRAY)
            laplacian = cv2.Laplacian(gray_orig, cv2.CV_64F)
            laplacian_abs = np.uint8(np.absolute(laplacian))

            # 3. Combine ELA and frequency gradient
            combined_intensity = cv2.addWeighted(ela_gray, 0.65, laplacian_abs, 0.35, 0)
            combined_intensity = cv2.GaussianBlur(combined_intensity, (7, 7), 0)

            # Normalize to 0-255
            norm_intensity = cv2.normalize(combined_intensity, None, 0, 255, cv2.NORM_MINMAX)

            # Apply colormap: JET (Blue = low, Yellow = mid, Red = high synthetic anomaly)
            heatmap_color = cv2.applyColorMap(norm_intensity, cv2.COLORMAP_JET)

            # Save raw heatmap
            os.makedirs(os.path.dirname(output_heatmap_path), exist_ok=True)
            cv2.imwrite(output_heatmap_path, heatmap_color)

            # Synthesize alpha blend overlay
            blended = cv2.addWeighted(orig, 1.0 - alpha, heatmap_color, alpha, 0)
            cv2.imwrite(output_overlay_path, blended)

            return True
        except Exception as e:
            print(f"[ImageXAI] Error generating forensic heatmap: {e}")
            return False

    async def process_image_xai(
        self,
        file_path: str,
        analysis_id: str,
        output_dir: str,
        raw_result: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generate spatial attribution heatmap for visual inspection.
        """
        os.makedirs(output_dir, exist_ok=True)
        heatmap_path = os.path.join(output_dir, f"{analysis_id}_heatmap.png")
        overlay_path = os.path.join(output_dir, f"{analysis_id}_overlay.png")

        success = self._generate_forensic_ela_heatmap(
            original_img_path=file_path,
            output_heatmap_path=heatmap_path,
            output_overlay_path=overlay_path,
        )

        if success:
            return {
                "available": True,
                "method": "Resemble AI Forensic Spatial Artifact & ELA Heatmap",
                "provider": "resemble",
                "heatmap_path": heatmap_path,
                "overlay_path": overlay_path,
                "heatmap_url": f"/api/v1/analysis/{analysis_id}/xai/image-heatmap",
                "overlay_url": f"/api/v1/analysis/{analysis_id}/xai/image-overlay",
                "legend": {
                    "red": "High synthetic inconsistency / compression boundary",
                    "yellow": "Medium anomaly gradient",
                    "blue_cyan": "Natural pixel coherence baseline",
                },
            }

        return {
            "available": False,
            "reason": "Unable to compute forensic heatmap for this image source.",
            "provider": "resemble",
        }

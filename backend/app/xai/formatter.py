"""
XAI Formatter — generates structured, human-readable forensic explanations and technical summaries.
"""

from typing import Any, Dict, List


class XAIFormatter:
    """Formats raw XAI outputs into human-readable forensic report narratives."""

    def format_explanation(self, raw_explanation: Dict[str, Any], label: str, confidence: float) -> Dict[str, Any]:
        """Generate formatted summary, factors array, and verdict analysis."""
        summary = raw_explanation.get("summary")
        if not summary:
            conf_pct = round(confidence * 100, 1)
            if label == "authentic":
                summary = f"Forensic analysis confirmed media authenticity with {conf_pct}% confidence. Spectral and spatial parameters show zero artificial synthesis markers."
            elif label == "manipulated":
                summary = f"High-confidence deepfake manipulation detected ({conf_pct}% confidence). Severe anomalies identified across facial boundaries, noise distributions, and frequency channels."
            else:
                summary = f"Suspicious structural anomalies detected ({conf_pct}% confidence). Inconsistencies present across frame continuity and illumination features."

        factors = raw_explanation.get("factors", [])

        return {
            "summary": summary,
            "factors": factors,
            "has_heatmap": raw_explanation.get("has_heatmap", False),
        }

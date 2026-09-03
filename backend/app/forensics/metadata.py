import os
import cv2
from PIL import Image
from typing import Dict, Any


from PIL.ExifTags import TAGS


def extract_image_metadata(file_path: str) -> Dict[str, Any]:
    """Extract forensic metadata from an image file using PIL and OpenCV."""
    metadata = {}
    try:
        with Image.open(file_path) as img:
            metadata["width"] = img.width
            metadata["height"] = img.height
            metadata["format"] = img.format
            metadata["mode"] = img.mode
            metadata["aspect_ratio"] = round(img.width / max(1, img.height), 3)

            # Extra EXIF information if present
            exif_details = {}
            if hasattr(img, "_getexif") and img._getexif():
                raw_exif = img._getexif()
                if raw_exif:
                    metadata["has_exif"] = True
                    metadata["exif_keys_count"] = len(raw_exif)
                    for tag_id, value in raw_exif.items():
                        tag = TAGS.get(tag_id, str(tag_id))
                        if isinstance(value, (int, float, str, bool)):
                            exif_details[tag] = value
                        else:
                            exif_details[tag] = str(value)
                    metadata["exif_tags"] = exif_details
                else:
                    metadata["has_exif"] = False
            else:
                metadata["has_exif"] = False

        # Additional OpenCV color channel analysis
        cv_img = cv2.imread(file_path)
        if cv_img is not None:
            metadata["channels"] = cv_img.shape[2] if len(cv_img.shape) > 2 else 1
    except Exception as e:
        metadata["error"] = f"Failed to parse image metadata: {str(e)}"
    
    return metadata



def extract_video_metadata(file_path: str) -> Dict[str, Any]:
    """Extract duration, resolution, frame rate, and frame count from a video using OpenCV."""
    metadata = {}
    try:
        cap = cv2.VideoCapture(file_path)
        if cap.isOpened():
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = round(total_frames / fps, 2) if fps > 0 else 0.0

            metadata["width"] = width
            metadata["height"] = height
            metadata["resolution"] = f"{width}x{height}"
            metadata["fps"] = round(fps, 2)
            metadata["frame_count"] = total_frames
            metadata["duration_seconds"] = duration
            cap.release()
        else:
            metadata["error"] = "Could not open video stream via OpenCV"
    except Exception as e:
        metadata["error"] = f"Failed to extract video metadata: {str(e)}"

    return metadata


def extract_audio_metadata(file_path: str) -> Dict[str, Any]:
    """Extract audio container file size and properties."""
    metadata = {}
    try:
        stat_info = os.stat(file_path)
        metadata["container_size_bytes"] = stat_info.st_size
        metadata["format"] = os.path.splitext(file_path)[1].lstrip(".").lower()
    except Exception as e:
        metadata["error"] = f"Failed to extract audio metadata: {str(e)}"

    return metadata


def extract_text_metadata(file_path: str) -> Dict[str, Any]:
    """Extract character count, word count, and line count from text documents."""
    metadata = {}
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            metadata["character_count"] = len(content)
            metadata["word_count"] = len(content.split())
            metadata["line_count"] = len(content.splitlines())
    except Exception as e:
        metadata["error"] = f"Failed to extract text metadata: {str(e)}"

    return metadata


def extract_media_metadata(file_path: str, media_type: str) -> Dict[str, Any]:
    """Dispatch forensic metadata extraction based on media type."""
    if media_type == "image":
        return extract_image_metadata(file_path)
    elif media_type == "video":
        return extract_video_metadata(file_path)
    elif media_type == "audio":
        return extract_audio_metadata(file_path)
    elif media_type == "text":
        return extract_text_metadata(file_path)
    return {}

"""
File hashing utilities.
"""

import hashlib
from typing import BinaryIO


def compute_sha256(file_path: str) -> str:
    """Compute SHA-256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def compute_sha256_from_stream(file: BinaryIO) -> str:
    """Compute SHA-256 hash from a file-like stream."""
    sha256 = hashlib.sha256()
    for chunk in iter(lambda: file.read(8192), b""):
        sha256.update(chunk)
    file.seek(0)
    return sha256.hexdigest()

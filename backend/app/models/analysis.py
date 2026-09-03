"""
SQLAlchemy database model for Analysis — stores detection results per media file.
"""

import uuid
from datetime import datetime
from sqlalchemy import String, Float, DateTime, ForeignKey, JSON, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Analysis(Base):
    """
    Analysis model representing a single detection analysis run on a media file.
    Each media file can have multiple analyses (re-runs, different providers, etc.)
    """
    __tablename__ = "analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    media_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("media_files.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    # Provider info
    provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    is_demo: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    # Status: "pending", "processing", "completed", "failed", "unsupported"
    status: Mapped[str] = mapped_column(
        String(50),
        default="pending",
        nullable=False,
        index=True,
    )
    job_id: Mapped[str] = mapped_column(
        String(255),
        nullable=True,
    )

    # Detection verdict
    label: Mapped[str] = mapped_column(
        String(50),
        nullable=True,
    )  # "authentic", "suspicious", "manipulated"
    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=True,
    )
    raw_score: Mapped[float] = mapped_column(
        Float,
        nullable=True,
    )

    # Full result payload from provider
    result_json: Mapped[dict] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
    )

    # Explainability payload
    explanation_json: Mapped[dict] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
    )

    # Modality-level breakdown
    modality_results_json: Mapped[list] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    # Error info
    error_message: Mapped[str] = mapped_column(
        Text,
        nullable=True,
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    completed_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True,
    )

    # Relationships
    media = relationship("MediaFile", backref="analyses")
    user = relationship("User", backref="analyses")

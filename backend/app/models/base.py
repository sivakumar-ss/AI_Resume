"""Shared model helpers: UTC timestamps and a portable JSON column type."""
from datetime import datetime, timezone

from sqlalchemy.dialects.postgresql import JSONB

from app.extensions import db


def utcnow():
    """Current timezone-aware UTC timestamp (used as a column default)."""
    return datetime.now(timezone.utc)


class TimestampMixin:
    """Adds created_at / updated_at columns to a model."""

    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=utcnow,
        onupdate=utcnow,
    )


# JSON on SQLite (local dev fallback), JSONB on PostgreSQL (Supabase).
JSONType = db.JSON().with_variant(JSONB, "postgresql")

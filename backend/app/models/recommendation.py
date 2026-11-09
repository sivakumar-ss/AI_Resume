"""Generated career recommendations — one row per career per generation batch."""
import uuid

from app.extensions import db
from app.models.base import JSONType, TimestampMixin


class Recommendation(TimestampMixin, db.Model):
    __tablename__ = "recommendations"
    __table_args__ = (
        # One score per career per batch — prevents duplicate rows on retries.
        db.UniqueConstraint(
            "user_id",
            "career_id",
            "batch_id",
            name="uq_recommendations_user_career_batch",
        ),
        db.CheckConstraint(
            "score >= 0 AND score <= 1", name="ck_recommendations_score"
        ),
        db.Index("ix_recommendations_user_created", "user_id", "created_at"),
        db.Index("ix_recommendations_career_id", "career_id"),
        db.Index("ix_recommendations_batch_id", "batch_id"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    career_id = db.Column(
        db.Integer,
        db.ForeignKey("careers.id", ondelete="CASCADE"),
        nullable=False,
    )
    # Groups the top-N rows produced by one engine run.
    batch_id = db.Column(db.String(36), nullable=False, default=lambda: str(uuid.uuid4()))
    score = db.Column(db.Numeric(5, 4), nullable=False)
    matched_skills = db.Column(JSONType, nullable=False, default=list)
    missing_skills = db.Column(JSONType, nullable=False, default=list)
    model_version = db.Column(db.String(50), nullable=False)

    user = db.relationship("User", back_populates="recommendations")
    career = db.relationship("Career", back_populates="recommendations")

    def __repr__(self):
        return (
            f"<Recommendation user_id={self.user_id} "
            f"career_id={self.career_id} score={self.score}>"
        )

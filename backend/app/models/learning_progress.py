"""Per-student progress on a learning resource (unique per profile + resource)."""
from app.extensions import db
from app.models.base import TimestampMixin


class LearningProgress(TimestampMixin, db.Model):
    __tablename__ = "learning_progress"
    __table_args__ = (
        db.UniqueConstraint(
            "student_profile_id",
            "learning_resource_id",
            name="uq_learning_progress_profile_resource",
        ),
        db.CheckConstraint(
            "status IN ('not_started', 'in_progress', 'completed')",
            name="ck_learning_progress_status",
        ),
        db.CheckConstraint(
            "progress_percent BETWEEN 0 AND 100",
            name="ck_learning_progress_percent",
        ),
        db.Index("ix_learning_progress_resource_id", "learning_resource_id"),
    )

    id = db.Column(db.Integer, primary_key=True)
    student_profile_id = db.Column(
        db.Integer,
        db.ForeignKey("student_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    learning_resource_id = db.Column(
        db.Integer,
        db.ForeignKey("learning_resources.id", ondelete="CASCADE"),
        nullable=False,
    )
    status = db.Column(db.String(20), nullable=False, default="not_started")
    progress_percent = db.Column(db.SmallInteger, nullable=False, default=0)
    started_at = db.Column(db.DateTime(timezone=True), nullable=True)
    completed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    profile = db.relationship("StudentProfile", back_populates="learning_progress")
    resource = db.relationship("LearningResource", back_populates="progress_entries")

    def __repr__(self):
        return (
            f"<LearningProgress profile={self.student_profile_id} "
            f"resource={self.learning_resource_id} {self.progress_percent}%>"
        )

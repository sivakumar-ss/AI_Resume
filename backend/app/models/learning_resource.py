"""Learning resources used to close skill gaps, optionally linked to a skill."""
from app.extensions import db
from app.models.base import TimestampMixin


class LearningResource(TimestampMixin, db.Model):
    __tablename__ = "learning_resources"
    __table_args__ = (
        db.CheckConstraint(
            "resource_type IN ('course', 'video', 'article', 'book', 'project', 'other')",
            name="ck_learning_resources_type",
        ),
        db.CheckConstraint(
            "difficulty IN ('beginner', 'intermediate', 'advanced')",
            name="ck_learning_resources_difficulty",
        ),
        db.Index("ix_learning_resources_skill_id", "skill_id"),
    )

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    url = db.Column(db.String(500), nullable=True, unique=True)
    provider = db.Column(db.String(100), nullable=True)  # e.g. Coursera, NPTEL
    resource_type = db.Column(db.String(20), nullable=False, default="course")
    difficulty = db.Column(db.String(20), nullable=True)
    description = db.Column(db.Text, nullable=True)
    skill_id = db.Column(
        db.Integer,
        db.ForeignKey("skills.id", ondelete="SET NULL"),
        nullable=True,
    )
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    skill = db.relationship("Skill", back_populates="learning_resources")
    progress_entries = db.relationship(
        "LearningProgress", back_populates="resource", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<LearningResource {self.title}>"

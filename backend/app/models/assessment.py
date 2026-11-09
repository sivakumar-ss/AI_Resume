"""Assessment attempts (interest / aptitude / skills questionnaires)."""
from app.extensions import db
from app.models.base import JSONType, TimestampMixin


class Assessment(TimestampMixin, db.Model):
    __tablename__ = "assessments"
    __table_args__ = (
        db.CheckConstraint("score >= 0", name="ck_assessments_score"),
        db.Index("ix_assessments_user_created", "user_id", "created_at"),
        db.Index("ix_assessments_type", "assessment_type"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    assessment_type = db.Column(db.String(50), nullable=False)  # interest | aptitude | skills
    responses = db.Column(JSONType, nullable=False, default=dict)
    score = db.Column(db.Numeric(5, 2), nullable=True)
    completed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    user = db.relationship("User", back_populates="assessments")

    def __repr__(self):
        return f"<Assessment {self.assessment_type} user_id={self.user_id}>"

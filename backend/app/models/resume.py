"""Resume uploads and their analysis results.

Privacy by design: the raw file and extracted text are NOT persisted — only
metadata and the structured skills returned by the spaCy pipeline.
"""
from app.extensions import db
from app.models.base import JSONType, TimestampMixin


class Resume(TimestampMixin, db.Model):
    __tablename__ = "resumes"
    __table_args__ = (
        db.CheckConstraint(
            "analysis_status IN ('pending', 'processed', 'failed')",
            name="ck_resumes_analysis_status",
        ),
        db.Index("ix_resumes_user_created", "user_id", "created_at"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    original_filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(20), nullable=False)  # pdf | docx | txt
    file_size_bytes = db.Column(db.Integer, nullable=True)
    extracted_skills = db.Column(JSONType, nullable=False, default=list)
    analysis_status = db.Column(db.String(20), nullable=False, default="pending")
    model_version = db.Column(db.String(50), nullable=True)

    user = db.relationship("User", back_populates="resumes")

    def __repr__(self):
        return f"<Resume {self.original_filename} status={self.analysis_status}>"

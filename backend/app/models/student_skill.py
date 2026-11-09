"""Join table: a student's skills with a proficiency level (1–5)."""
from app.extensions import db
from app.models.base import TimestampMixin


class StudentSkill(TimestampMixin, db.Model):
    __tablename__ = "student_skills"
    __table_args__ = (
        db.UniqueConstraint(
            "student_profile_id",
            "skill_id",
            name="uq_student_skills_profile_skill",
        ),
        db.CheckConstraint(
            "proficiency_level BETWEEN 1 AND 5",
            name="ck_student_skills_proficiency",
        ),
        db.Index("ix_student_skills_skill_id", "skill_id"),
    )

    id = db.Column(db.Integer, primary_key=True)
    student_profile_id = db.Column(
        db.Integer,
        db.ForeignKey("student_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    skill_id = db.Column(
        db.Integer,
        db.ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
    )
    proficiency_level = db.Column(db.SmallInteger, nullable=False, default=1)

    profile = db.relationship("StudentProfile", back_populates="skills")
    skill = db.relationship("Skill", back_populates="student_skills")

    def __repr__(self):
        return (
            f"<StudentSkill profile={self.student_profile_id} "
            f"skill={self.skill_id} level={self.proficiency_level}>"
        )

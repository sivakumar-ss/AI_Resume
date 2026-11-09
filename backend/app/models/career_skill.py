"""Join table: skills required by a career, with an importance weight (1–5)."""
from app.extensions import db
from app.models.base import TimestampMixin


class CareerSkill(TimestampMixin, db.Model):
    __tablename__ = "career_skills"
    __table_args__ = (
        db.UniqueConstraint(
            "career_id", "skill_id", name="uq_career_skills_career_skill"
        ),
        db.CheckConstraint(
            "importance BETWEEN 1 AND 5", name="ck_career_skills_importance"
        ),
        db.Index("ix_career_skills_skill_id", "skill_id"),
    )

    id = db.Column(db.Integer, primary_key=True)
    career_id = db.Column(
        db.Integer,
        db.ForeignKey("careers.id", ondelete="CASCADE"),
        nullable=False,
    )
    skill_id = db.Column(
        db.Integer,
        db.ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
    )
    importance = db.Column(db.SmallInteger, nullable=False, default=3)

    career = db.relationship("Career", back_populates="career_skills")
    skill = db.relationship("Skill", back_populates="career_skills")

    def __repr__(self):
        return (
            f"<CareerSkill career={self.career_id} "
            f"skill={self.skill_id} importance={self.importance}>"
        )

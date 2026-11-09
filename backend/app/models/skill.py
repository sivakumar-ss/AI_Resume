"""Skill catalogue — canonical skills shared by students, careers and resources.

Store names in lowercase (e.g. "python", "machine learning") so the unique
constraint prevents case-only duplicates ("Python" vs "python").
"""
from app.extensions import db
from app.models.base import TimestampMixin


class Skill(TimestampMixin, db.Model):
    __tablename__ = "skills"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    category = db.Column(db.String(50), nullable=True)  # e.g. programming, data, soft
    description = db.Column(db.Text, nullable=True)

    student_skills = db.relationship(
        "StudentSkill", back_populates="skill", cascade="all, delete-orphan"
    )
    career_skills = db.relationship(
        "CareerSkill", back_populates="skill", cascade="all, delete-orphan"
    )
    # Keep resources if a skill is removed (FK is ON DELETE SET NULL).
    learning_resources = db.relationship("LearningResource", back_populates="skill")

    def __repr__(self):
        return f"<Skill {self.name}>"

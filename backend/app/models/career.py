"""Career catalogue — the documents scored by the recommendation engine."""
from app.extensions import db
from app.models.base import TimestampMixin


class Career(TimestampMixin, db.Model):
    __tablename__ = "careers"
    __table_args__ = (
        db.CheckConstraint(
            "demand_score >= 0 AND demand_score <= 10",
            name="ck_careers_demand_score",
        ),
        db.Index("ix_careers_demand_score", "demand_score"),
    )

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    industry = db.Column(db.String(100), nullable=True)
    demand_score = db.Column(db.Numeric(4, 2), nullable=False, default=0)
    # Guidance content from the career dataset. These are nullable so older
    # rows and manually created careers keep working.
    learning_path = db.Column(db.Text, nullable=True)
    prerequisites = db.Column(db.Text, nullable=True)

    career_skills = db.relationship(
        "CareerSkill", back_populates="career", cascade="all, delete-orphan"
    )
    recommendations = db.relationship(
        "Recommendation", back_populates="career", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Career {self.title}>"

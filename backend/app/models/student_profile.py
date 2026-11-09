"""Student academic profile — one-to-one with User, feature source for the ML model."""
from app.constants import DEFAULT_EDUCATION_LEVEL, DEFAULT_EXPERIENCE_LEVEL
from app.extensions import db
from app.models.base import JSONType, TimestampMixin


class StudentProfile(TimestampMixin, db.Model):
    __tablename__ = "student_profiles"
    __table_args__ = (
        db.CheckConstraint(
            "semester BETWEEN 1 AND 8", name="ck_student_profiles_semester"
        ),
        db.CheckConstraint(
            "cgpa >= 0 AND cgpa <= 10", name="ck_student_profiles_cgpa"
        ),
        db.CheckConstraint(
            "education_level IN ('high_school', 'higher_secondary', 'diploma', "
            "'undergraduate', 'postgraduate', 'doctorate')",
            name="ck_student_profiles_education_level",
        ),
        db.CheckConstraint(
            "experience_level IN ('beginner', 'intermediate', 'advanced')",
            name="ck_student_profiles_experience_level",
        ),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    # `branch` is the student's department (kept for schema/API compatibility).
    branch = db.Column(db.String(100), nullable=False)
    semester = db.Column(db.SmallInteger, nullable=False)
    cgpa = db.Column(db.Numeric(4, 2), nullable=True)
    graduation_year = db.Column(db.SmallInteger, nullable=True)
    education_level = db.Column(
        db.String(30),
        nullable=False,
        default=DEFAULT_EDUCATION_LEVEL,
        server_default=DEFAULT_EDUCATION_LEVEL,
    )
    college_name = db.Column(db.String(200), nullable=True)
    experience_level = db.Column(
        db.String(30),
        nullable=False,
        default=DEFAULT_EXPERIENCE_LEVEL,
        server_default=DEFAULT_EXPERIENCE_LEVEL,
    )
    bio = db.Column(db.Text, nullable=True)
    # Free-form interests (e.g. ["ai", "design"]); skills live in student_skills.
    interests = db.Column(JSONType, nullable=False, default=list)

    user = db.relationship("User", back_populates="profile")
    skills = db.relationship(
        "StudentSkill", back_populates="profile", cascade="all, delete-orphan"
    )
    learning_progress = db.relationship(
        "LearningProgress", back_populates="profile", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<StudentProfile user_id={self.user_id}>"

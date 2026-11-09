"""User account model — authentication identity for students and admins."""
from app.extensions import db
from app.models.base import TimestampMixin


class User(TimestampMixin, db.Model):
    __tablename__ = "users"
    __table_args__ = (
        db.CheckConstraint("role IN ('student', 'admin')", name="ck_users_role"),
    )

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="student")
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    # Incremented on logout; every JWT carries the version it was issued with.
    token_version = db.Column(
        db.Integer, nullable=False, default=0, server_default="0"
    )

    # One-to-one: a student has exactly one academic profile.
    profile = db.relationship(
        "StudentProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    # User-owned history.
    resumes = db.relationship(
        "Resume", back_populates="user", cascade="all, delete-orphan"
    )
    assessments = db.relationship(
        "Assessment", back_populates="user", cascade="all, delete-orphan"
    )
    recommendations = db.relationship(
        "Recommendation", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User {self.email}>"

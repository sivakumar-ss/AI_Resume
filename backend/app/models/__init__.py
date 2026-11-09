"""SQLAlchemy models.

Import every model here so `db.create_all()` and relationship resolution see
the complete schema. Keep this list in sync with database/schema.sql.
"""
from app.models.assessment import Assessment
from app.models.base import JSONType, TimestampMixin, utcnow
from app.models.career import Career
from app.models.career_skill import CareerSkill
from app.models.learning_progress import LearningProgress
from app.models.learning_resource import LearningResource
from app.models.recommendation import Recommendation
from app.models.resume import Resume
from app.models.skill import Skill
from app.models.student_profile import StudentProfile
from app.models.student_skill import StudentSkill
from app.models.user import User

__all__ = [
    "Assessment",
    "Career",
    "CareerSkill",
    "JSONType",
    "LearningProgress",
    "LearningResource",
    "Recommendation",
    "Resume",
    "Skill",
    "StudentProfile",
    "StudentSkill",
    "TimestampMixin",
    "User",
    "utcnow",
]

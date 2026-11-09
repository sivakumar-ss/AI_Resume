"""Admin-only endpoints."""
from flask import Blueprint, jsonify
from sqlalchemy import func, select

from app.extensions import db
from app.models.career import Career
from app.models.student_profile import StudentProfile
from app.models.user import User
from app.utils.auth import admin_required

admin_bp = Blueprint("admin", __name__)


@admin_bp.get("/stats")
@admin_required
def stats():
    """GET /api/admin/stats — aggregate counts for administrators."""
    total_users = db.session.scalar(select(func.count()).select_from(User)) or 0
    total_students = (
        db.session.scalar(
            select(func.count()).select_from(User).where(User.role == "student")
        )
        or 0
    )
    total_admins = (
        db.session.scalar(
            select(func.count()).select_from(User).where(User.role == "admin")
        )
        or 0
    )
    active_users = (
        db.session.scalar(
            select(func.count()).select_from(User).where(User.is_active.is_(True))
        )
        or 0
    )
    total_profiles = (
        db.session.scalar(select(func.count()).select_from(StudentProfile)) or 0
    )
    total_careers = db.session.scalar(select(func.count()).select_from(Career)) or 0

    return (
        jsonify(
            {
                "users": {
                    "total": total_users,
                    "students": total_students,
                    "admins": total_admins,
                    "active": active_users,
                },
                "profiles": total_profiles,
                "careers": total_careers,
            }
        ),
        200,
    )

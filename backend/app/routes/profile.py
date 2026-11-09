"""Student profile and technical-skill routes.

Ownership always comes from the JWT; these endpoints accept no user IDs.
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from app.schemas.profile import (
    ProfileUpdateSchema,
    SkillCreateSchema,
    SkillUpdateSchema,
)
from app.schemas.serializers import (
    serialize_profile,
    serialize_student_skill,
)
from app.services.profile_service import (
    add_skill_for_user,
    delete_skill_for_user,
    get_profile_for_user,
    list_skills_for_user,
    update_profile_for_user,
    update_skill_for_user,
)
from app.utils.auth import get_current_user
from app.utils.validation import get_json_body

profile_bp = Blueprint("profile", __name__)


@profile_bp.get("")
@jwt_required()
def get_profile():
    """GET /api/profile — read the authenticated student's profile."""
    user = get_current_user()
    profile = get_profile_for_user(user)
    return jsonify(serialize_profile(profile, user)), 200


@profile_bp.route("", methods=["PUT", "PATCH"])
@jwt_required()
def update_profile():
    """PUT/PATCH /api/profile — update only the current student's profile."""
    user = get_current_user()
    data = ProfileUpdateSchema(get_json_body()).done()
    profile = update_profile_for_user(user, data)
    return jsonify(serialize_profile(profile, user)), 200


@profile_bp.get("/skills")
@jwt_required()
def list_skills():
    """GET /api/profile/skills — list the current student's skills."""
    user = get_current_user()
    links = list_skills_for_user(user)
    return (
        jsonify(
            {
                "items": [
                    serialize_student_skill(link) for link in links
                ],
                "total": len(links),
            }
        ),
        200,
    )


@profile_bp.post("/skills")
@jwt_required()
def add_skill():
    """POST /api/profile/skills — add a technical skill by name."""
    user = get_current_user()
    data = SkillCreateSchema(get_json_body()).done()
    link = add_skill_for_user(user, data)
    return jsonify(serialize_student_skill(link)), 201


@profile_bp.route("/skills/<int:student_skill_id>", methods=["PUT", "PATCH"])
@jwt_required()
def update_skill(student_skill_id):
    """PUT/PATCH /api/profile/skills/<id> — update skill proficiency."""
    user = get_current_user()
    data = SkillUpdateSchema(get_json_body()).done()
    link = update_skill_for_user(user, student_skill_id, data)
    return jsonify(serialize_student_skill(link)), 200


@profile_bp.delete("/skills/<int:student_skill_id>")
@jwt_required()
def delete_skill(student_skill_id):
    """DELETE /api/profile/skills/<id> — remove a skill from the profile."""
    user = get_current_user()
    removed = delete_skill_for_user(user, student_skill_id)
    return (
        jsonify(
            {
                "message": "Skill removed from profile",
                **removed,
            }
        ),
        200,
    )

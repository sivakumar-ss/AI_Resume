"""Skill gap analysis routes."""
from flask import Blueprint, jsonify, request

from app.services.skill_gap_service import analyze_skill_gap
from app.utils.auth import get_current_user, role_required


skill_gap_bp = Blueprint("skill_gap", __name__)


@skill_gap_bp.get("")
@role_required("student")
def analyze():
    """GET /api/skill-gap — compare the student profile with recommended careers."""
    user = get_current_user()
    generate = request.args.get("generate", "").strip().lower() in {"1", "true", "yes"}
    result = analyze_skill_gap(user, generate=generate)
    return jsonify(result), 200

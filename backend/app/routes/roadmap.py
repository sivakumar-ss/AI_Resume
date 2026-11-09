"""Personalized learning roadmap routes."""
from flask import Blueprint, jsonify, request

from app.services.roadmap_service import generate_roadmap, update_progress
from app.utils.auth import get_current_user, role_required


roadmap_bp = Blueprint("roadmap", __name__)


@roadmap_bp.get("")
@role_required("student")
def get_roadmap():
    """GET /api/roadmap — generate or read a roadmap for a career."""
    user = get_current_user()
    career_id = request.args.get("career_id", type=int)
    result = generate_roadmap(user, career_id=career_id)
    return jsonify(result), 200


@roadmap_bp.post("/generate")
@role_required("student")
def generate():
    """POST /api/roadmap/generate — explicitly generate a roadmap."""
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    career_id = data.get("career_id")
    if career_id is not None:
        try:
            career_id = int(career_id)
        except (TypeError, ValueError):
            return jsonify({"error": "career_id must be an integer"}), 422
    result = generate_roadmap(user, career_id=career_id)
    return jsonify(result), 200


@roadmap_bp.patch("/progress/<int:resource_id>")
@roadmap_bp.put("/progress/<int:resource_id>")
@role_required("student")
def progress(resource_id):
    """PATCH /api/roadmap/progress/<id> — update task progress."""
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if not status:
        return jsonify({"error": "status is required"}), 422
    progress_percent = data.get("progress_percent")
    result = update_progress(user, resource_id, status, progress_percent)
    return jsonify(result), 200

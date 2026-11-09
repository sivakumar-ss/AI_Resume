"""Career recommendation routes."""
from flask import Blueprint, jsonify

from app.services.recommendation_service import (
    generate_recommendations,
    get_latest_recommendations,
)
from app.utils.auth import get_current_user, role_required


recommendations_bp = Blueprint("recommendations", __name__)


@recommendations_bp.post("")
@role_required("student")
def generate():
    """POST /api/recommendations — generate and persist a recommendation batch."""
    user = get_current_user()
    result = generate_recommendations(user)
    return jsonify(result), 200


@recommendations_bp.get("")
@role_required("student")
def latest():
    """GET /api/recommendations — read the latest saved recommendation batch."""
    user = get_current_user()
    result = get_latest_recommendations(user)
    if result is None:
        return jsonify({"recommendations": [], "message": "No recommendations generated yet."}), 200
    return jsonify(result), 200

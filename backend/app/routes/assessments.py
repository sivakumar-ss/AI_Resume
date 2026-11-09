"""Skill assessment routes."""
from flask import Blueprint, jsonify, request

from app.services.assessment_service import (
    get_questions,
    get_results,
    list_categories,
    submit_assessment,
)
from app.utils.auth import get_current_user, role_required


assessments_bp = Blueprint("assessments", __name__)


@assessments_bp.get("/categories")
@role_required("student")
def categories():
    """GET /api/assessments/categories — list available assessments."""
    return jsonify({"categories": list_categories()}), 200


@assessments_bp.get("/questions")
@role_required("student")
def questions():
    """GET /api/assessments/questions?category=python"""
    category = request.args.get("category", "").strip()
    if not category:
        return jsonify({"error": "category is required"}), 422
    return jsonify(get_questions(category)), 200


@assessments_bp.post("/submit")
@role_required("student")
def submit():
    """POST /api/assessments/submit — score and save an assessment."""
    user = get_current_user()
    data = request.get_json(silent=True) or {}
    category = (data.get("category") or "").strip()
    answers = data.get("answers") or {}
    if not category:
        return jsonify({"error": "category is required"}), 422
    if not isinstance(answers, dict):
        return jsonify({"error": "answers must be an object"}), 422

    result = submit_assessment(user, category, answers, data.get("time_taken_seconds"))
    return jsonify(result), 200


@assessments_bp.get("/results")
@role_required("student")
def results():
    """GET /api/assessments/results — latest score per category."""
    user = get_current_user()
    return jsonify(get_results(user)), 200

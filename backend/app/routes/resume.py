"""Resume analysis routes.

Files are processed in memory/private storage and are not exposed through any
public URL. Only extracted metadata and skills are persisted.
"""
from flask import Blueprint, jsonify, request

from app.services.resume_service import analyze_resume
from app.utils.auth import get_current_user, role_required
from app.utils.validation import get_json_body


resume_bp = Blueprint("resume", __name__)


@resume_bp.post("/analyze")
@role_required("student")
def analyze():
    """POST /api/resume/analyze — extract skills from an uploaded resume."""
    user = get_current_user()

    if request.content_type and request.content_type.startswith("multipart/form-data"):
        file = request.files.get("file")
        result = analyze_resume(user, file=file)
    else:
        data = get_json_body()
        result = analyze_resume(user, text=data.get("text"))

    return jsonify(result), 200

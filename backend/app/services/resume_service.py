"""Resume analysis service.

The uploaded file is written to a private, non-public directory only while it
is being processed. It is deleted before the request returns, so the database
stores metadata and extracted skills rather than the raw resume.
"""

import uuid
from pathlib import Path

from flask import current_app, request
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.resume import Resume
from app.models.user import User
from app.services.nlp.extractor import (
    MATCHER_BACKEND,
    clean_text,
    extract_docx_text,
    extract_education,
    extract_experience,
    extract_pdf_text,
    extract_skills,
)
from app.utils.errors import ApiError

MAX_RESUME_BYTES = 5 * 1024 * 1024
ALLOWED_RESUME_TYPES = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MODEL_VERSION = f"{MATCHER_BACKEND}-v1"


def _private_upload_dir():
    return Path(current_app.root_path).parent / "instance" / "private_uploads" / "resumes"


def _validate_and_read_upload(file):
    original_name = secure_filename(file.filename or "")
    suffix = Path(original_name).suffix.lower()

    if suffix not in ALLOWED_RESUME_TYPES:
        raise ApiError(
            "Unsupported file type. Upload a PDF or DOCX resume.",
            status_code=400,
        )

    expected_mime = ALLOWED_RESUME_TYPES[suffix]
    if file.mimetype and file.mimetype not in {expected_mime, "application/octet-stream"}:
        raise ApiError(
            "The uploaded file does not look like a supported resume type.",
            status_code=400,
        )

    data = file.read()
    if not data:
        raise ApiError("The uploaded file is empty.", status_code=422)
    if len(data) > MAX_RESUME_BYTES:
        raise ApiError(
            "Resume is too large. The maximum size is 5 MB.",
            status_code=413,
        )

    return original_name or f"resume{suffix}", suffix, data


def analyze_resume(user: User, *, file=None, text=None):
    """Extract structured information from a resume and store its metadata."""
    if text is not None:
        raw_text = text.strip()
        if not raw_text:
            raise ApiError("Resume text cannot be empty.", status_code=422)
        original_filename = "pasted-resume.txt"
        file_type = "txt"
        file_size = len(raw_text.encode("utf-8"))
        private_path = None
    else:
        if file is None or not getattr(file, "filename", None):
            raise ApiError("Choose a PDF or DOCX resume to analyze.", status_code=400)

        original_filename, suffix, data = _validate_and_read_upload(file)
        file_type = suffix.lstrip(".")
        file_size = len(data)

        # Keep the upload in a private directory while extracting it. The path is
        # never returned to the client and the file is removed in the finally block.
        private_dir = _private_upload_dir()
        private_dir.mkdir(parents=True, exist_ok=True)
        private_path = private_dir / f"{uuid.uuid4().hex}{suffix}"
        private_path.write_bytes(data)

        try:
            if suffix == ".pdf":
                raw_text = extract_pdf_text(data)
            else:
                raw_text = extract_docx_text(data)
        finally:
            private_path.unlink(missing_ok=True)

    cleaned = clean_text(raw_text)
    skills = extract_skills(cleaned)
    education = extract_education(raw_text)
    experience = extract_experience(raw_text)

    resume = Resume(
        user_id=user.id,
        original_filename=original_filename,
        file_type=file_type,
        file_size_bytes=file_size,
        extracted_skills=skills,
        analysis_status="processed",
        model_version=MODEL_VERSION,
    )
    db.session.add(resume)
    db.session.commit()

    return {
        "resume_id": resume.id,
        "original_filename": resume.original_filename,
        "file_type": resume.file_type,
        "file_size_bytes": resume.file_size_bytes,
        "extracted_skills": skills,
        "skill_count": len(skills),
        "education": education,
        "experience": experience["lines"],
        "experience_years": experience["years"],
        "model_version": resume.model_version,
        "message": (
            "Resume analyzed successfully. Review the extracted skills before "
            "adding them to your profile."
        ),
    }

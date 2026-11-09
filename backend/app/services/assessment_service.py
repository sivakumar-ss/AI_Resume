"""Skill assessment logic.

Questions and correct answers live only in the backend. The API returns
questions without answers, scores submissions on the server, and then returns
review details.
"""

from datetime import datetime, timezone

from sqlalchemy import select

from app.extensions import db
from app.models.assessment import Assessment
from app.models.user import User
from app.services.assessment_questions import ASSESSMENT_CATEGORIES, QUESTIONS
from app.utils.errors import ApiError


def _category(category_id):
    category = next((item for item in ASSESSMENT_CATEGORIES if item["id"] == category_id), None)
    if category is None:
        raise ApiError("Unknown assessment category", status_code=404)
    return category


def list_categories():
    result = []
    for category in ASSESSMENT_CATEGORIES:
        questions = QUESTIONS.get(category["id"], [])
        result.append(
            {
                "id": category["id"],
                "name": category["name"],
                "question_count": len(questions),
                "time_limit_seconds": category["time_limit_seconds"],
            }
        )
    return result


def get_questions(category_id):
    category = _category(category_id)
    questions = QUESTIONS.get(category_id, [])
    return {
        "category": category["id"],
        "name": category["name"],
        "time_limit_seconds": category["time_limit_seconds"],
        "questions": [
            {
                "id": question["id"],
                "prompt": question["prompt"],
                "options": question["options"],
            }
            for question in questions
        ],
    }


def submit_assessment(user: User, category_id, answers, time_taken_seconds=None):
    if user.role != "student":
        raise ApiError("Assessments are only available to student accounts", status_code=403)

    category = _category(category_id)
    questions = QUESTIONS.get(category_id, [])
    if not questions:
        raise ApiError("This assessment has no questions", status_code=503)

    normalized_answers = {}
    for question in questions:
        value = answers.get(question["id"]) if isinstance(answers, dict) else None
        try:
            normalized_answers[question["id"]] = int(value)
        except (TypeError, ValueError):
            normalized_answers[question["id"]] = None

    correct_count = 0
    details = []
    for question in questions:
        selected = normalized_answers[question["id"]]
        is_correct = selected == question["correct_index"]
        if is_correct:
            correct_count += 1
        details.append(
            {
                "question_id": question["id"],
                "selected": selected,
                "correct": is_correct,
                "correct_index": question["correct_index"],
                "explanation": question["explanation"],
            }
        )

    percentage = round((correct_count / len(questions)) * 100, 2)

    assessment = Assessment(
        user_id=user.id,
        assessment_type=category_id,
        responses=normalized_answers,
        score=percentage,
        completed_at=datetime.now(timezone.utc),
    )
    db.session.add(assessment)
    db.session.commit()

    return {
        "assessment_id": assessment.id,
        "category": category_id,
        "name": category["name"],
        "total_questions": len(questions),
        "correct_count": correct_count,
        "score": percentage,
        "time_taken_seconds": time_taken_seconds,
        "details": details,
        "message": "Assessment submitted and saved.",
    }


def get_results(user: User):
    if user.role != "student":
        raise ApiError("Assessments are only available to student accounts", status_code=403)

    rows = db.session.scalars(
        select(Assessment)
        .where(Assessment.user_id == user.id)
        .order_by(Assessment.created_at.desc())
    ).all()

    latest_by_category = {}
    for row in rows:
        if row.assessment_type not in latest_by_category:
            latest_by_category[row.assessment_type] = row

    results = []
    for category in ASSESSMENT_CATEGORIES:
        row = latest_by_category.get(category["id"])
        results.append(
            {
                "category": category["id"],
                "name": category["name"],
                "attempted": row is not None,
                "score": float(row.score) if row is not None and row.score is not None else None,
                "completed_at": row.completed_at.isoformat() if row is not None and row.completed_at else None,
                "question_count": len(QUESTIONS.get(category["id"], [])),
            }
        )

    return {"results": results}

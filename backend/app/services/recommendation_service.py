
"""Career recommendation engine.

The engine combines four signals:

    final score = 50% skill similarity
               + 20% interest match
               + 20% assessment score
               + 10% education match

TF-IDF and cosine similarity come from scikit-learn. A factor is removed and
its weight is redistributed when the student has no data for it, so missing
information is not silently treated as a zero.
"""

import uuid

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import select

from app.extensions import db
from app.models.assessment import Assessment
from app.models.career import Career
from app.services.profile_service import get_profile_for_user, list_skills_for_user
from app.utils.errors import ApiError

MODEL_VERSION = "tfidf-weighted-v1"
BASE_WEIGHTS = {
    "skill_similarity": 0.50,
    "interest_match": 0.20,
    "assessment_score": 0.20,
    "education_match": 0.10,
}


def _text(value):
    return " ".join(str(value or "").split())


def _skill_names(links):
    return [link.skill.name for link in links if getattr(link, "skill", None)]


def _career_skill_names(career):
    return [link.skill.name for link in getattr(career, "career_skills", []) if getattr(link, "skill", None)]


def _weighted_skill_document(skills, weights):
    tokens = []
    for skill, weight in zip(skills, weights):
        repeat = max(1, int(round(weight or 1)))
        tokens.extend([skill] * repeat)
    return " ".join(tokens)


def _cosine_scores(student_document, career_documents):
    """Return cosine similarity between one student document and many careers."""
    if not student_document.strip() or not any(document.strip() for document in career_documents):
        return [0.0 for _ in career_documents]

    try:
        vectorizer = TfidfVectorizer(
            lowercase=True,
            token_pattern=r"(?u)\b[\w][\w.+#-]*\b",
        )
        matrix = vectorizer.fit_transform([student_document] + career_documents)
    except ValueError:
        return [0.0 for _ in career_documents]

    similarities = cosine_similarity(matrix[0:1], matrix[1:]).flatten()
    return [float(max(0.0, min(1.0, value))) for value in similarities]
def _assessment_score(assessments):
    values = []
    for assessment in assessments:
        if assessment.score is None:
            continue
        value = float(assessment.score)
        if value > 1:
            value = value / 100.0
        values.append(max(0.0, min(1.0, value)))

    if not values:
        return None
    return sum(values) / len(values)


def _available_factors(student, careers, assessments):
    student_skills = student["skills"]
    career_skill_sets = [set(career["skill_names"]) for career in careers]

    skill_available = bool(student_skills) and any(career_skill_sets)
    interest_available = bool(student["interests"]) and any(
        career["text"].strip() for career in careers
    )
    assessment_available = _assessment_score(assessments) is not None
    education_available = bool(student["education_document"].strip()) and any(
        career["text"].strip() for career in careers
    )

    return {
        "skill_similarity": skill_available,
        "interest_match": interest_available,
        "assessment_score": assessment_available,
        "education_match": education_available,
    }


def _normalize_weights(available):
    total = sum(BASE_WEIGHTS[name] for name, is_available in available.items() if is_available)
    if total <= 0:
        return {name: 0.0 for name in BASE_WEIGHTS}
    return {
        name: (BASE_WEIGHTS[name] / total if available[name] else 0.0)
        for name in BASE_WEIGHTS
    }
def _career_text(career):
    skill_names = _career_skill_names(career)
    return _text(
        " ".join(
            [
                career.title,
                career.industry or "",
                career.description or "",
                " ".join(skill_names),
                career.learning_path or "",
                career.prerequisites or "",
            ]
        )
    )


def _prepare_inputs(user, profile, skill_links, careers, assessments):
    student_skill_names = _skill_names(skill_links)
    student_skill_weights = [link.proficiency_level or 1 for link in skill_links if getattr(link, "skill", None)]

    student = {
        "skills": student_skill_names,
        "interests": list(profile.interests or []),
        "education_document": _text(
            " ".join(
                [
                    profile.branch or "",
                    profile.education_level or "",
                    profile.experience_level or "",
                    profile.college_name or "",
                    profile.bio or "",
                ]
            )
        ),
        "skill_document": _weighted_skill_document(student_skill_names, student_skill_weights),
        "interest_document": _text(" ".join(profile.interests or [])),
    }

    prepared_careers = []
    for career in careers:
        skill_names = _career_skill_names(career)
        importance_weights = [link.importance or 1 for link in career.career_skills if getattr(link, "skill", None)]
        prepared_careers.append(
            {
                "career": career,
                "skill_names": skill_names,
                "skill_document": _weighted_skill_document(skill_names, importance_weights),
                "text": _career_text(career),
            }
        )

    return student, prepared_careers, assessments or []


def score_careers(user, profile, skill_links, careers, assessments=None):
    """Score every career and return a list of dictionaries.

    The returned dictionaries are plain data, which keeps this function easy to
    unit test without HTTP or database sessions beyond the supplied objects.
    """
    if not careers:
        return []

    if assessments is None:
        assessments = db.session.scalars(
            db.select(Assessment)
            .where(Assessment.user_id == user.id)
            .order_by(Assessment.created_at.desc())
        ).all()

    student, prepared_careers, assessments = _prepare_inputs(
        user, profile, skill_links, careers, assessments or []
    )
    assessment_value = _assessment_score(assessments)

    career_skill_documents = [career["skill_document"] for career in prepared_careers]
    career_text_documents = [career["text"] for career in prepared_careers]

    skill_scores = _cosine_scores(student["skill_document"], career_skill_documents)
    interest_scores = _cosine_scores(student["interest_document"], career_text_documents)
    education_scores = _cosine_scores(student["education_document"], career_text_documents)

    available = _available_factors(student, prepared_careers, assessments)
    weights = _normalize_weights(available)

    student_skill_set = set(student["skills"])
    results = []

    for index, prepared in enumerate(prepared_careers):
        career = prepared["career"]
        career_skill_set = set(prepared["skill_names"])
        matched_skills = sorted(student_skill_set & career_skill_set)
        missing_skills = sorted(career_skill_set - student_skill_set)

        components = {
            "skill_similarity": skill_scores[index],
            "interest_match": interest_scores[index],
            "assessment_score": assessment_value if assessment_value is not None else 0.0,
            "education_match": education_scores[index],
        }

        final_score = 0.0
        for name, value in components.items():
            if available[name]:
                final_score += value * weights[name]

        final_score = max(0.0, min(1.0, final_score))

        explanation_parts = []
        if available["skill_similarity"]:
            explanation_parts.append(
                f"Skill similarity is {components['skill_similarity'] * 100:.0f}% "
                f"({len(matched_skills)} of {len(career_skill_set)} listed skills match)."
            )
        if available["interest_match"]:
            explanation_parts.append(
                f"Interest alignment is {components['interest_match'] * 100:.0f}%."
            )
        if available["assessment_score"]:
            explanation_parts.append(
                f"Assessment score is {components['assessment_score'] * 100:.0f}%."
            )
        if available["education_match"]:
            explanation_parts.append(
                f"Education/background alignment is {components['education_match'] * 100:.0f}%."
            )
        if matched_skills:
            explanation_parts.append("Matching skills: " + ", ".join(matched_skills) + ".")
        if missing_skills:
            explanation_parts.append("Skills to build next: " + ", ".join(missing_skills) + ".")
        else:
            explanation_parts.append("You already cover all listed skills for this career.")

        explanation = " ".join(explanation_parts)
        explanation += (
            " This score measures profile similarity, not the probability of "
            "career success."
        )

        results.append(
            {
                "career": career,
                "score": final_score,
                "score_percent": round(final_score * 100),
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "explanation": explanation,
                "factors": {
                    name: (components[name] if available[name] else None)
                    for name in BASE_WEIGHTS
                },
                "weights_used": weights,
                "available_factors": available,
            }
        )

    results.sort(key=lambda item: (-item["score"], -len(item["matched_skills"]), item["career"].title))
    return results

def generate_recommendations(user, limit=5):
    """Generate, persist and return the top career recommendations for a user."""
    if user.role != "student":
        raise ApiError("Recommendations are only available to student accounts", status_code=403)

    profile = get_profile_for_user(user)
    skill_links = list_skills_for_user(user)
    careers = db.session.scalars(db.select(Career).order_by(Career.title)).all()
    if not careers:
        raise ApiError("The careers catalogue is not seeded yet.", status_code=503)

    assessments = db.session.scalars(
        db.select(Assessment).where(Assessment.user_id == user.id).order_by(Assessment.created_at.desc())
    ).all()

    scored = score_careers(user, profile, skill_links, careers, assessments)
    top = scored[:limit]

    batch_id = str(uuid.uuid4())
    saved_recommendations = []

    from app.models.recommendation import Recommendation

    for item in top:
        career = item["career"]
        recommendation = Recommendation(
            user_id=user.id,
            career_id=career.id,
            batch_id=batch_id,
            score=item["score"],
            matched_skills=item["matched_skills"],
            missing_skills=item["missing_skills"],
            model_version=MODEL_VERSION,
        )
        db.session.add(recommendation)

        saved_recommendations.append(
            {
                "career": {
                    "id": career.id,
                    "title": career.title,
                    "description": career.description,
                    "industry": career.industry,
                    "learning_path": career.learning_path,
                    "prerequisites": career.prerequisites,
                },
                "score": item["score"],
                "score_percent": item["score_percent"],
                "matched_skills": item["matched_skills"],
                "missing_skills": item["missing_skills"],
                "explanation": item["explanation"],
                "factors": item["factors"],
                "weights_used": item["weights_used"],
                "available_factors": item["available_factors"],
            }
        )

    db.session.commit()

    return {
        "batch_id": batch_id,
        "model_version": MODEL_VERSION,
        "limit": limit,
        "recommendations": saved_recommendations,
        "disclaimer": (
            "These scores measure profile similarity to career requirements. "
            "They are not a probability of career success."
        ),
    }


def get_latest_recommendations(user):
    """Return the most recently generated recommendation batch for a user."""
    from app.models.recommendation import Recommendation

    latest_batch = db.session.scalar(
        db.select(Recommendation.batch_id)
        .where(Recommendation.user_id == user.id)
        .order_by(Recommendation.created_at.desc())
        .limit(1)
    )
    if latest_batch is None:
        return None

    rows = db.session.scalars(
        db.select(Recommendation)
        .where(Recommendation.user_id == user.id, Recommendation.batch_id == latest_batch)
        .order_by(Recommendation.score.desc(), Recommendation.id)
    ).all()

    return {
        "batch_id": latest_batch,
        "model_version": rows[0].model_version if rows else MODEL_VERSION,
        "recommendations": [
            {
                "career": {
                    "id": row.career.id,
                    "title": row.career.title,
                    "description": row.career.description,
                    "industry": row.career.industry,
                    "learning_path": row.career.learning_path,
                    "prerequisites": row.career.prerequisites,
                },
                "score": float(row.score),
                "score_percent": round(float(row.score) * 100),
                "matched_skills": row.matched_skills or [],
                "missing_skills": row.missing_skills or [],
                "explanation": None,
                "factors": None,
                "weights_used": None,
                "available_factors": None,
            }
            for row in rows
        ],
        "disclaimer": (
            "These scores measure profile similarity to career requirements. "
            "They are not a probability of career success."
        ),
    }

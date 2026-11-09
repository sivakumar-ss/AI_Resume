"""Skill gap analysis based on recommended careers and the student profile."""

from collections import defaultdict

from app.extensions import db
from app.models.career import Career
from app.services.profile_service import get_profile_for_user, list_skills_for_user
from app.services.recommendation_service import (
    generate_recommendations,
    get_latest_recommendations,
)
from app.utils.errors import ApiError


def _proficiency_by_skill(skill_links):
    return {
        link.skill.name: int(link.proficiency_level or 0)
        for link in skill_links
        if getattr(link, "skill", None)
    }


def _career_gap(career, proficiency_by_skill):
    required = sorted(
        career.career_skills,
        key=lambda link: (-(link.importance or 0), link.skill.name),
    )

    available = []
    partial = []
    missing = []
    total_importance = 0
    earned_importance = 0

    for link in required:
        skill = link.skill
        importance = int(link.importance or 1)
        proficiency = int(proficiency_by_skill.get(skill.name, 0))
        contribution = min(proficiency, importance)

        total_importance += importance
        earned_importance += contribution

        item = {
            "skill": skill.name,
            "importance": importance,
            "proficiency": proficiency,
            "contribution": contribution,
        }

        if proficiency <= 0:
            missing.append(item)
        elif proficiency >= importance:
            available.append(item)
        else:
            partial.append(item)

    if total_importance:
        readiness = round((earned_importance / total_importance) * 100, 1)
    else:
        readiness = 100.0

    return {
        "career": {
            "id": career.id,
            "title": career.title,
            "industry": career.industry,
        },
        "total_importance": total_importance,
        "earned_importance": earned_importance,
        "readiness_score": readiness,
        "available_skills": available,
        "partial_skills": partial,
        "missing_skills": missing,
    }


def analyze_skill_gap(user, generate=False):
    if user.role != "student":
        raise ApiError("Skill gap analysis is only available to student accounts", status_code=403)

    profile = get_profile_for_user(user)
    skill_links = list_skills_for_user(user)
    proficiency_by_skill = _proficiency_by_skill(skill_links)

    latest = get_latest_recommendations(user)
    if latest is None and generate:
        latest = generate_recommendations(user)

    if latest is None or not latest.get("recommendations"):
        return {
            "has_recommendations": False,
            "message": "Generate career recommendations first, then run skill gap analysis.",
            "overall_readiness": 0,
            "careers": [],
            "priority_skills": [],
            "disclaimer": (
                "Skill gap scores compare your saved proficiency with the importance "
                "of skills required by recommended careers."
            ),
        }

    career_ids = [item["career"]["id"] for item in latest["recommendations"]]
    careers = db.session.scalars(
        db.select(Career).where(Career.id.in_(career_ids))
    ).all()
    career_by_id = {career.id: career for career in careers}

    career_gaps = []
    for item in latest["recommendations"]:
        career = career_by_id.get(item["career"]["id"])
        if career is None:
            continue
        gap = _career_gap(career, proficiency_by_skill)
        gap["recommendation_score"] = item.get("score")
        gap["recommendation_score_percent"] = item.get("score_percent")
        career_gaps.append(gap)

    if career_gaps:
        overall_readiness = round(
            sum(gap["readiness_score"] for gap in career_gaps) / len(career_gaps), 1
        )
    else:
        overall_readiness = 0.0

    # Aggregate missing or partial skills across recommended careers. A skill is
    # more urgent when it is required by several careers or has high importance.
    aggregates = defaultdict(
        lambda: {"importance": 0, "careers": set(), "proficiency": 0, "max_importance": 0}
    )
    for gap in career_gaps:
        career_title = gap["career"]["title"]
        for item in gap["partial_skills"] + gap["missing_skills"]:
            aggregate = aggregates[item["skill"]]
            aggregate["importance"] += item["importance"]
            aggregate["careers"].add(career_title)
            aggregate["proficiency"] = item["proficiency"]
            aggregate["max_importance"] = max(aggregate["max_importance"], item["importance"])

    priority_skills = []
    for name, aggregate in aggregates.items():
        if aggregate["proficiency"] == 0:
            status = "missing"
            reason = "Not currently on your profile."
        else:
            status = "partial"
            reason = f"Currently at proficiency {aggregate['proficiency']}/5."
        priority_skills.append(
            {
                "skill": name,
                "status": status,
                "proficiency": aggregate["proficiency"],
                "total_importance": aggregate["importance"],
                "max_importance": aggregate["max_importance"],
                "career_count": len(aggregate["careers"]),
                "careers": sorted(aggregate["careers"]),
                "reason": reason,
            }
        )

    priority_skills.sort(
        key=lambda item: (
            -item["total_importance"],
            -item["career_count"],
            -item["max_importance"],
            item["skill"],
        )
    )

    return {
        "has_recommendations": True,
        "batch_id": latest.get("batch_id"),
        "model_version": latest.get("model_version"),
        "overall_readiness": overall_readiness,
        "careers": career_gaps,
        "priority_skills": priority_skills[:8],
        "disclaimer": (
            "Readiness is a weighted coverage score: earned importance divided by "
            "required importance. It measures preparation, not guaranteed success."
        ),
    }

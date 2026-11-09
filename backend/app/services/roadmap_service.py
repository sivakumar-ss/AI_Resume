
"""Personalized learning roadmap generation and progress tracking."""

from datetime import datetime, timezone

from app.extensions import db
from app.models.career import Career
from app.models.learning_progress import LearningProgress
from app.models.learning_resource import LearningResource
from app.models.user import User
from app.services.profile_service import get_profile_for_user, list_skills_for_user
from app.services.recommendation_service import get_latest_recommendations
from app.services.roadmap_resources import ROADMAP_RESOURCES
from app.services.skill_gap_service import _career_gap
from app.utils.errors import ApiError


PHASES = [
    {"day": 30, "title": "Foundation", "description": "Beginner tasks for your highest-priority gaps."},
    {"day": 60, "title": "Practice", "description": "Intermediate tasks that turn knowledge into projects."},
    {"day": 90, "title": "Mastery", "description": "Advanced tasks for production-ready skills."},
]

DIFFICULTY_TO_PHASE = {
    "beginner": 30,
    "intermediate": 60,
    "advanced": 90,
}


def _resources_for_skill(skill_name):
    return ROADMAP_RESOURCES.get(
        skill_name,
        [
            {
                "difficulty": "beginner",
                "title": f"{skill_name.title()} fundamentals",
                "provider": "Curated resource",
                "resource_type": "article",
                "url": f"https://www.google.com/search?q={skill_name.replace(' ', '+')}+tutorial+for+beginners",
                "estimated_hours": 8,
            }
        ],
    )


def _upsert_resource(skill, resource_data):
    resource = LearningResource.query.filter_by(url=resource_data["url"]).first()
    if resource is None:
        resource = LearningResource(
            title=resource_data["title"],
            url=resource_data["url"],
            provider=resource_data["provider"],
            resource_type=resource_data["resource_type"],
            difficulty=resource_data["difficulty"],
            description=f"Roadmap task for {skill.name}.",
            skill_id=skill.id,
            is_active=True,
        )
        db.session.add(resource)
        db.session.flush()
    else:
        resource.title = resource_data["title"]
        resource.provider = resource_data["provider"]
        resource.resource_type = resource_data["resource_type"]
        resource.difficulty = resource_data["difficulty"]
        resource.skill_id = skill.id
        resource.is_active = True
        db.session.flush()
    return resource


def _get_or_create_progress(profile, resource):
    progress = LearningProgress.query.filter_by(
        student_profile_id=profile.id,
        learning_resource_id=resource.id,
    ).first()
    if progress is None:
        progress = LearningProgress(
            student_profile_id=profile.id,
            learning_resource_id=resource.id,
            status="not_started",
            progress_percent=0,
        )
        db.session.add(progress)
        db.session.flush()
    return progress
def _select_career(user, career_id=None):
    if career_id is not None:
        career = db.session.get(Career, career_id)
        if career is None:
            raise ApiError("Career not found", status_code=404)
        return career

    latest = get_latest_recommendations(user)
    if latest and latest.get("recommendations"):
        first_career_id = latest["recommendations"][0]["career"]["id"]
        career = db.session.get(Career, first_career_id)
        if career is not None:
            return career

    raise ApiError(
        "Generate career recommendations before creating a roadmap.",
        status_code=409,
    )


def generate_roadmap(user, career_id=None):
    if user.role != "student":
        raise ApiError("Learning roadmaps are only available to student accounts", status_code=403)

    profile = get_profile_for_user(user)
    skill_links = list_skills_for_user(user)
    proficiency_by_skill = {
        link.skill.name: int(link.proficiency_level or 0)
        for link in skill_links
        if getattr(link, "skill", None)
    }

    career = _select_career(user, career_id)
    gap = _career_gap(career, proficiency_by_skill)

    # Target gaps first; if every required skill is already covered, still create
    # advanced practice tasks for the career's required skills.
    priority_skills = gap["partial_skills"] + gap["missing_skills"]
    if not priority_skills:
        priority_skills = [
            {
                "skill": item["skill"],
                "importance": item["importance"],
                "proficiency": item["proficiency"],
            }
            for item in gap["available_skills"]
        ]

    if not priority_skills:
        return {
            "has_roadmap": False,
            "career": {"id": career.id, "title": career.title, "industry": career.industry},
            "message": "This career has no required skills to build a roadmap from.",
            "overall_progress": {"completed": 0, "total": 0, "percent": 0},
            "phases": [],
            "priority_skills": [],
        }

    skill_by_name = {link.skill.name: link.skill for link in career.career_skills if getattr(link, "skill", None)}

    tasks_by_phase = {30: [], 60: [], 90: []}
    priority_output = []

    for priority, item in enumerate(priority_skills, start=1):
        skill_name = item["skill"]
        skill = skill_by_name.get(skill_name)
        if skill is None:
            from app.models.skill import Skill

            skill = Skill.query.filter_by(name=skill_name).first()
            if skill is None:
                skill = Skill(name=skill_name, category="technical")
                db.session.add(skill)
                db.session.flush()

        for resource_data in _resources_for_skill(skill_name):
            difficulty = resource_data["difficulty"]
            phase_day = DIFFICULTY_TO_PHASE.get(difficulty, 30)
            resource = _upsert_resource(skill, resource_data)
            progress = _get_or_create_progress(profile, resource)

            task = {
                "resource_id": resource.id,
                "skill": skill_name,
                "title": resource.title,
                "provider": resource.provider,
                "resource_type": resource.resource_type,
                "difficulty": resource.difficulty,
                "url": resource.url,
                "estimated_hours": resource_data["estimated_hours"],
                "priority": priority,
                "skill_importance": item["importance"],
                "status": progress.status,
                "progress_percent": progress.progress_percent,
                "phase_day": phase_day,
            }
            tasks_by_phase[phase_day].append(task)

        priority_output.append(
            {
                "skill": skill_name,
                "priority": priority,
                "importance": item["importance"],
                "proficiency": item["proficiency"],
                "status": "missing" if item["proficiency"] == 0 else "partial",
            }
        )

    db.session.commit()

    phases = []
    total_tasks = 0
    completed_tasks = 0
    for phase in PHASES:
        tasks = sorted(
            tasks_by_phase[phase["day"]],
            key=lambda task: (task["priority"], task["skill"], task["difficulty"]),
        )
        total_tasks += len(tasks)
        completed_tasks += sum(1 for task in tasks if task["status"] == "completed")
        phases.append(
            {
                "day": phase["day"],
                "title": phase["title"],
                "description": phase["description"],
                "tasks": tasks,
                "task_count": len(tasks),
                "completed_count": sum(1 for task in tasks if task["status"] == "completed"),
            }
        )

    overall_percent = round((completed_tasks / total_tasks) * 100, 1) if total_tasks else 0.0

    return {
        "has_roadmap": True,
        "career": {
            "id": career.id,
            "title": career.title,
            "industry": career.industry,
            "description": career.description,
        },
        "overall_progress": {
            "completed": completed_tasks,
            "total": total_tasks,
            "percent": overall_percent,
        },
        "phases": phases,
        "priority_skills": priority_output,
        "disclaimer": (
            "Progress is based only on tasks you mark complete. Estimated durations "
            "are planning guides, not guarantees."
        ),
    }
def update_progress(user, resource_id, status, progress_percent=None):
    if user.role != "student":
        raise ApiError("Learning roadmaps are only available to student accounts", status_code=403)

    profile = get_profile_for_user(user)
    progress = LearningProgress.query.filter_by(
        student_profile_id=profile.id,
        learning_resource_id=resource_id,
    ).first()
    if progress is None:
        resource = db.session.get(LearningResource, resource_id)
        if resource is None:
            raise ApiError("Learning resource not found", status_code=404)
        progress = LearningProgress(
            student_profile_id=profile.id,
            learning_resource_id=resource_id,
            status="not_started",
            progress_percent=0,
        )
        db.session.add(progress)

    if status not in {"not_started", "in_progress", "completed"}:
        raise ApiError("Status must be not_started, in_progress, or completed", status_code=422)

    if progress_percent is None:
        progress_percent = 100 if status == "completed" else 0 if status == "not_started" else progress.progress_percent
    progress_percent = int(progress_percent)
    if progress_percent < 0 or progress_percent > 100:
        raise ApiError("Progress percent must be between 0 and 100", status_code=422)

    progress.status = status
    progress.progress_percent = progress_percent

    now = datetime.now(timezone.utc)
    if status == "in_progress" and progress.started_at is None:
        progress.started_at = now
    if status == "completed":
        progress.completed_at = now
        if progress.started_at is None:
            progress.started_at = now
    elif status == "not_started":
        progress.completed_at = None

    db.session.commit()

    return {
        "resource_id": progress.learning_resource_id,
        "status": progress.status,
        "progress_percent": progress.progress_percent,
        "started_at": progress.started_at.isoformat() if progress.started_at else None,
        "completed_at": progress.completed_at.isoformat() if progress.completed_at else None,
    }

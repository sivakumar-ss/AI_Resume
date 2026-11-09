"""Student profile business logic.

Every function receives the authenticated user; no caller-supplied user ID is
trusted. This is the central ownership enforcement for profile records and the
student's technical-skill links.
"""
from sqlalchemy.exc import IntegrityError

from app.constants import (
    DEFAULT_EDUCATION_LEVEL,
    DEFAULT_EXPERIENCE_LEVEL,
    DEFAULT_SKILL_PROFICIENCY,
)
from app.extensions import db
from app.models.skill import Skill
from app.models.student_profile import StudentProfile
from app.models.student_skill import StudentSkill
from app.utils.errors import ApiError

_PROFILE_FIELDS = (
    "branch",
    "semester",
    "cgpa",
    "graduation_year",
    "education_level",
    "college_name",
    "experience_level",
    "bio",
    "interests",
)


def get_profile_for_user(user):
    """Return the user's profile, creating a default one for legacy accounts."""
    if user.role != "student":
        raise ApiError(
            "Student profiles are only available to student accounts",
            status_code=403,
        )

    profile = db.session.scalar(
        db.select(StudentProfile).where(StudentProfile.user_id == user.id)
    )
    if profile is None:
        profile = StudentProfile(
            user_id=user.id,
            branch="Undeclared",
            semester=1,
            interests=[],
            education_level=DEFAULT_EDUCATION_LEVEL,
            experience_level=DEFAULT_EXPERIENCE_LEVEL,
        )
        db.session.add(profile)
        db.session.commit()
    return profile


def update_profile_for_user(user, data):
    """Update only fields supplied by the client; ownership stays with *user*."""
    profile = get_profile_for_user(user)
    technical_skills = data.get("technical_skills")

    for field in _PROFILE_FIELDS:
        if field in data:
            setattr(profile, field, data[field])

    # The display name lives on users, not student_profiles.
    if "full_name" in data:
        user.full_name = data["full_name"]

    try:
        if technical_skills is not None:
            _sync_technical_skills(profile, technical_skills)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ApiError(
            "Profile update conflicted with existing data, please retry",
            status_code=409,
        )

    return profile


# ---- technical skills ---------------------------------------------------


def _normalize_skill_name(name):
    """Canonical catalogue form: trimmed, single-spaced and lowercase."""
    return " ".join(name.split()).lower()


def _get_or_create_skill(name):
    """Return a catalogue skill, creating a technical one when necessary."""
    skill = db.session.scalar(db.select(Skill).where(Skill.name == name))
    if skill is None:
        skill = Skill(name=name, category="technical")
        db.session.add(skill)
        db.session.flush()
    return skill


def _sync_technical_skills(profile, names):
    """Replace the profile's skill set while preserving existing proficiency.

    Called from the bulk ``technical_skills`` field on PUT/PATCH /api/profile.
    The global skill catalogue rows are never deleted here.
    """
    normalized = []
    seen = set()
    for raw_name in names:
        name = _normalize_skill_name(raw_name)
        if name and name not in seen:
            seen.add(name)
            normalized.append(name)

    existing_links = db.session.scalars(
        db.select(StudentSkill).where(
            StudentSkill.student_profile_id == profile.id
        )
    ).all()
    existing_by_name = {link.skill.name: link for link in existing_links}

    for name, link in existing_by_name.items():
        if name not in seen:
            db.session.delete(link)

    for name in normalized:
        if name in existing_by_name:
            continue
        skill = _get_or_create_skill(name)
        db.session.add(
            StudentSkill(
                student_profile_id=profile.id,
                skill_id=skill.id,
                proficiency_level=DEFAULT_SKILL_PROFICIENCY,
            )
        )


def _get_owned_skill_link(user, student_skill_id):
    """Return the student's profile and a link scoped to that profile.

    Looking up by both IDs prevents one student from reading or mutating
    another student's skill links (IDOR).
    """
    profile = get_profile_for_user(user)
    link = db.session.scalar(
        db.select(StudentSkill).where(
            StudentSkill.id == student_skill_id,
            StudentSkill.student_profile_id == profile.id,
        )
    )
    if link is None:
        raise ApiError("Skill not found in your profile", status_code=404)
    return profile, link


def list_skills_for_user(user):
    """Return the authenticated student's technical-skill links."""
    profile = get_profile_for_user(user)
    return db.session.scalars(
        db.select(StudentSkill)
        .where(StudentSkill.student_profile_id == profile.id)
        .order_by(StudentSkill.id)
    ).all()


def add_skill_for_user(user, data):
    """Add a skill by name, reusing the catalogue row when it already exists."""
    profile = get_profile_for_user(user)
    name = _normalize_skill_name(data["name"])

    try:
        skill = _get_or_create_skill(name)

        existing = db.session.scalar(
            db.select(StudentSkill).where(
                StudentSkill.student_profile_id == profile.id,
                StudentSkill.skill_id == skill.id,
            )
        )
        if existing is not None:
            raise ApiError("Skill is already in your profile", status_code=409)

        link = StudentSkill(
            student_profile_id=profile.id,
            skill_id=skill.id,
            proficiency_level=data.get(
                "proficiency_level", DEFAULT_SKILL_PROFICIENCY
            ),
        )
        db.session.add(link)
        db.session.commit()
    except IntegrityError:
        # Handles concurrent inserts of the same skill name or profile link.
        db.session.rollback()
        raise ApiError("Skill is already in your profile", status_code=409)

    return link


def update_skill_for_user(user, student_skill_id, data):
    """Update only the proficiency of a link owned by the current student."""
    _, link = _get_owned_skill_link(user, student_skill_id)
    link.proficiency_level = data["proficiency_level"]
    db.session.commit()
    return link


def delete_skill_for_user(user, student_skill_id):
    """Remove a skill link owned by the current student.

    The global ``skills`` catalogue row is intentionally left intact because
    other students and careers may reference it.
    """
    _, link = _get_owned_skill_link(user, student_skill_id)
    payload = {
        "student_skill_id": link.id,
        "skill_id": link.skill_id,
        "name": link.skill.name,
    }
    db.session.delete(link)
    db.session.commit()
    return payload

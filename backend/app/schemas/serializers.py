"""Safe JSON serializers.

Never include ``password_hash`` or ``token_version`` in API responses.
"""


def _iso(value):
    return value.isoformat() if value is not None else None


def serialize_user(user):
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": _iso(user.created_at),
        "updated_at": _iso(user.updated_at),
    }


def serialize_student_skill(student_skill):
    """Serialize a student_skills link (the skill id is the catalogue id)."""
    skill = student_skill.skill
    return {
        "id": student_skill.id,
        "skill_id": student_skill.skill_id,
        "name": skill.name,
        "category": skill.category,
        "description": skill.description,
        "proficiency_level": student_skill.proficiency_level,
        "created_at": _iso(student_skill.created_at),
        "updated_at": _iso(student_skill.updated_at),
    }


def serialize_profile(profile, user=None):
    if profile is None:
        return None

    owner = user or getattr(profile, "user", None)
    interests = profile.interests or []
    links = sorted(profile.skills, key=lambda item: item.id or 0)

    return {
        "id": profile.id,
        "full_name": owner.full_name if owner is not None else None,
        "education_level": profile.education_level,
        # `department` is the API name; `branch` is kept as a legacy alias.
        "department": profile.branch,
        "branch": profile.branch,
        "college_name": profile.college_name,
        "graduation_year": profile.graduation_year,
        "experience_level": profile.experience_level,
        "technical_skills": [
            serialize_student_skill(link) for link in links
        ],
        "career_interests": interests,
        "interests": interests,
        "semester": profile.semester,
        "cgpa": float(profile.cgpa) if profile.cgpa is not None else None,
        "bio": profile.bio,
        "created_at": _iso(profile.created_at),
        "updated_at": _iso(profile.updated_at),
    }

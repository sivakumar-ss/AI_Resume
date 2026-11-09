"""Student profile and technical-skill request schemas."""
from app.constants import (
    DEFAULT_SKILL_PROFICIENCY,
    EDUCATION_LEVELS,
    EXPERIENCE_LEVELS,
)
from app.utils.validation import Schema


def _merge_alias(validator, canonical, alias):
    """Store an alias under its canonical field and reject conflicts."""
    canonical_value = validator.cleaned.get(canonical)
    alias_value = validator.cleaned.get(alias)
    if alias_value is None:
        return
    if canonical_value is not None and canonical_value != alias_value:
        validator.errors[alias] = (
            f"must match {canonical} when both are provided"
        )
        return
    validator.cleaned[canonical] = alias_value
    validator.cleaned.pop(alias, None)


class ProfileUpdateSchema(Schema):
    """Partial profile update for the authenticated student.

    Only the fields present in the request are changed. User IDs are never
    accepted here — ownership comes from the JWT. ``department`` is an alias
    for the existing ``branch`` column; ``career_interests`` is an alias for
    ``interests``.
    """

    def load(self):
        v = self.validator
        v.string("full_name", required=False, min_length=2, max_length=120)
        v.string("department", required=False, max_length=100)
        v.string("branch", required=False, max_length=100)
        v.enum("education_level", EDUCATION_LEVELS, required=False)
        v.string("college_name", required=False, max_length=200)
        v.integer("semester", required=False, min_value=1, max_value=8)
        v.integer(
            "graduation_year", required=False, min_value=2000, max_value=2100
        )
        v.number("cgpa", required=False, min_value=0, max_value=10)
        v.string("bio", required=False, max_length=1000)
        v.enum("experience_level", EXPERIENCE_LEVELS, required=False)
        v.string_list(
            "career_interests", required=False, max_items=20, item_max_length=50
        )
        v.string_list(
            "interests", required=False, max_items=20, item_max_length=50
        )
        # Convenience for a full profile form: replaces the technical-skill set.
        # Granular add/update/delete remains available under /profile/skills.
        v.string_list(
            "technical_skills",
            required=False,
            max_items=50,
            item_max_length=100,
        )
        _merge_alias(v, "branch", "department")
        _merge_alias(v, "interests", "career_interests")


class SkillCreateSchema(Schema):
    """Add a technical skill by name (matched case-insensitively)."""

    def load(self):
        v = self.validator
        v.string("name", min_length=1, max_length=100)
        v.integer(
            "proficiency_level",
            required=False,
            min_value=1,
            max_value=5,
            default=DEFAULT_SKILL_PROFICIENCY,
        )


class SkillUpdateSchema(Schema):
    """Update the proficiency of one of the student's existing skills."""

    def load(self):
        self.validator.integer(
            "proficiency_level", required=True, min_value=1, max_value=5
        )

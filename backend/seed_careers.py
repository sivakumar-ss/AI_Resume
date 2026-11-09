"""Seed the careers catalogue from database/careers_dataset.csv.

Run from the backend directory:

    python seed_careers.py

The script is idempotent: existing careers are updated, their skill links are
rebuilt, and missing skills are created. Optional skills are added to the shared
skills catalogue even when they are not linked as required career skills.
"""

import argparse
import csv
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CSV = PROJECT_ROOT / "database" / "careers_dataset.csv"

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app import create_app
from app.extensions import db
from app.models.career import Career
from app.models.career_skill import CareerSkill
from app.models.skill import Skill

SKILL_CATEGORIES = {
    "python": "programming",
    "java": "programming",
    "javascript": "programming",
    "typescript": "programming",
    "c": "programming",
    "c++": "programming",
    "c#": "programming",
    "sql": "database",
    "postgresql": "database",
    "mysql": "database",
    "mongodb": "database",
    "redis": "database",
    "html": "frontend",
    "css": "frontend",
    "react": "frontend",
    "tailwind css": "frontend",
    "bootstrap": "frontend",
    "node.js": "backend",
    "express": "backend",
    "flask": "backend",
    "django": "backend",
    "fastapi": "backend",
    "java spring": "backend",
    "git": "tools",
    "docker": "devops",
    "kubernetes": "devops",
    "aws": "cloud",
    "azure": "cloud",
    "gcp": "cloud",
    "linux": "systems",
    "bash": "systems",
    "rest api": "backend",
    "graphql": "backend",
    "machine learning": "ai",
    "deep learning": "ai",
    "natural language processing": "ai",
    "data analysis": "data",
    "pandas": "data",
    "numpy": "data",
    "scikit-learn": "ai",
    "tensorflow": "ai",
    "pytorch": "ai",
    "power bi": "data",
    "tableau": "data",
    "excel": "data",
    "figma": "design",
    "testing": "quality",
    "ci/cd": "devops",
}


def normalize_skill(name):
    return " ".join(name.strip().lower().split())


def get_or_create_skill(name):
    normalized = normalize_skill(name)
    if not normalized:
        return None

    skill = Skill.query.filter_by(name=normalized).first()
    if skill is None:
        skill = Skill(
            name=normalized,
            category=SKILL_CATEGORIES.get(normalized, "technical"),
        )
        db.session.add(skill)
        db.session.flush()
    return skill


def parse_skill_list(value):
    return [item.strip() for item in value.split(";") if item.strip()]


def parse_importance_list(value, skill_count):
    values = [int(item.strip()) for item in value.split(";") if item.strip()]
    if len(values) != skill_count:
        raise ValueError(
            f"Expected {skill_count} importance values, found {len(values)}: {value!r}"
        )
    if any(value < 1 or value > 5 for value in values):
        raise ValueError(f"Skill importance must be between 1 and 5: {value!r}")
    return values


def seed(csv_path, dry_run=False):
    csv_path = Path(csv_path)
    if not csv_path.is_file():
        raise FileNotFoundError(f"Career dataset not found: {csv_path}")

    app = create_app()
    with app.app_context():
        created_careers = 0
        updated_careers = 0
        skill_links = 0

        with csv_path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            required_columns = {
                "career_name",
                "description",
                "domain",
                "required_skills",
                "required_skill_importance",
                "optional_skills",
                "optional_skill_importance",
                "beginner_learning_path",
                "prerequisites",
            }
            missing = required_columns - set(reader.fieldnames or [])
            if missing:
                raise ValueError(f"CSV is missing columns: {sorted(missing)}")

            for row_number, row in enumerate(reader, start=2):
                title = row["career_name"].strip()
                if not title:
                    raise ValueError(f"Row {row_number} has an empty career_name")

                career = Career.query.filter_by(title=title).first()
                if career is None:
                    career = Career(
                        title=title,
                        description=row["description"].strip(),
                        industry=row["domain"].strip(),
                        demand_score=0,
                        learning_path=row["beginner_learning_path"].strip(),
                        prerequisites=row["prerequisites"].strip(),
                    )
                    db.session.add(career)
                    db.session.flush()
                    created_careers += 1
                else:
                    career.description = row["description"].strip()
                    career.industry = row["domain"].strip()
                    career.learning_path = row["beginner_learning_path"].strip()
                    career.prerequisites = row["prerequisites"].strip()
                    updated_careers += 1
                    db.session.flush()

                # Rebuild this career's required-skill links so reruns stay clean.
                CareerSkill.query.filter_by(career_id=career.id).delete()

                required_skills = parse_skill_list(row["required_skills"])
                required_importances = parse_importance_list(
                    row["required_skill_importance"], len(required_skills)
                )

                for skill_name, importance in zip(required_skills, required_importances):
                    skill = get_or_create_skill(skill_name)
                    if skill is None:
                        continue
                    db.session.add(
                        CareerSkill(
                            career_id=career.id,
                            skill_id=skill.id,
                            importance=importance,
                        )
                    )
                    skill_links += 1

                # Optional skills are kept in the shared catalogue for reuse. They
                # are not linked as required skills because the schema has no
                # required/optional flag.
                for skill_name in parse_skill_list(row["optional_skills"]):
                    get_or_create_skill(skill_name)

                if not dry_run:
                    db.session.commit()
                else:
                    db.session.rollback()

        print(f"Seeded careers from {csv_path}")
        print(f"  created: {created_careers}")
        print(f"  updated: {updated_careers}")
        print(f"  required skill links: {skill_links}")


def main():
    parser = argparse.ArgumentParser(description="Seed careers from a CSV file.")
    parser.add_argument(
        "--csv",
        default=str(DEFAULT_CSV),
        help=f"Path to the career dataset CSV (default: {DEFAULT_CSV})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and validate the CSV without writing to the database.",
    )
    args = parser.parse_args()
    seed(args.csv, dry_run=args.dry_run)


if __name__ == "__main__":
    main()

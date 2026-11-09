"""Unit tests for the career recommendation algorithm."""
import unittest

from app import create_app
from app.extensions import db
from app.models.assessment import Assessment
from app.models.career import Career
from app.models.career_skill import CareerSkill
from app.models.skill import Skill
from app.models.student_profile import StudentProfile
from app.models.student_skill import StudentSkill
from app.models.user import User
from app.services.profile_service import get_profile_for_user
from app.services.recommendation_service import score_careers


class RecommendationEngineTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app("testing")
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

        self.user = User(
            email="student@college.edu",
            password_hash="hashed",
            full_name="Asha Rao",
            role="student",
            is_active=True,
        )
        db.session.add(self.user)
        db.session.flush()

        self.profile = StudentProfile(
            user_id=self.user.id,
            branch="Computer Science",
            semester=5,
            interests=["machine learning", "data"],
            education_level="undergraduate",
            experience_level="beginner",
            bio="Interested in AI and analytics.",
        )
        db.session.add(self.profile)
        db.session.flush()

        self.python = self._skill("python")
        self.sql = self._skill("sql")
        self.git = self._skill("git")

        self._link_skill(self.python, 4)
        self._link_skill(self.sql, 3)

        self.career_one = self._career(
            "Python Developer",
            "Software Engineering",
            [("python", 5), ("sql", 4), ("git", 3)],
        )
        self.career_two = self._career(
            "Data Scientist",
            "Data",
            [("python", 5), ("machine learning", 5), ("sql", 4)],
        )
        db.session.commit()

        self.profile = get_profile_for_user(self.user)
        self.skill_links = self.profile.skills if hasattr(self.profile, "skills") else []
        # The helper above may not expose links; use the profile relationship.
        from app.services.profile_service import list_skills_for_user

        self.skill_links = list_skills_for_user(self.user)

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        db.engine.dispose()
        self.ctx.pop()

    def _skill(self, name):
        skill = Skill(name=name, category="technical")
        db.session.add(skill)
        db.session.flush()
        return skill

    def _link_skill(self, skill, proficiency):
        link = StudentSkill(
            student_profile_id=self.profile.id,
            skill_id=skill.id,
            proficiency_level=proficiency,
        )
        db.session.add(link)
        db.session.flush()
        return link

    def _career(self, title, industry, skills):
        career = Career(title=title, description=title, industry=industry, demand_score=0)
        db.session.add(career)
        db.session.flush()
        for name, importance in skills:
            skill = Skill.query.filter_by(name=name).first()
            if skill is None:
                skill = Skill(name=name, category="technical")
                db.session.add(skill)
                db.session.flush()
            db.session.add(
                CareerSkill(career_id=career.id, skill_id=skill.id, importance=importance)
            )
        db.session.flush()
        return career

    def test_scores_are_sorted_and_bounded(self):
        careers = [self.career_one, self.career_two]
        results = score_careers(self.user, self.profile, self.skill_links, careers)

        self.assertEqual(len(results), 2)
        self.assertGreaterEqual(results[0]["score"], results[1]["score"])
        for result in results:
            self.assertGreaterEqual(result["score"], 0.0)
            self.assertLessEqual(result["score"], 1.0)
            self.assertGreaterEqual(result["score_percent"], 0)
            self.assertLessEqual(result["score_percent"], 100)

    def test_matched_and_missing_skills_are_reported(self):
        careers = [self.career_one]
        result = score_careers(self.user, self.profile, self.skill_links, careers)[0]

        self.assertEqual(result["matched_skills"], ["python", "sql"])
        self.assertEqual(result["missing_skills"], ["git"])
        self.assertIn("python", result["explanation"])
        self.assertIn("git", result["explanation"])

    def test_missing_assessment_redistributes_weight(self):
        careers = [self.career_one]
        result = score_careers(self.user, self.profile, self.skill_links, careers)[0]

        self.assertFalse(result["available_factors"]["assessment_score"])
        self.assertEqual(result["weights_used"]["assessment_score"], 0.0)
        self.assertAlmostEqual(
            sum(result["weights_used"].values()), 1.0, places=6
        )

    def test_interest_and_education_factors_are_available(self):
        careers = [self.career_one]
        result = score_careers(self.user, self.profile, self.skill_links, careers)[0]

        self.assertTrue(result["available_factors"]["interest_match"])
        self.assertTrue(result["available_factors"]["education_match"])
        self.assertIsNotNone(result["factors"]["interest_match"])
        self.assertIsNotNone(result["factors"]["education_match"])

    def test_empty_career_list_returns_empty(self):
        self.assertEqual(score_careers(self.user, self.profile, self.skill_links, []), [])

    def test_explanation_states_similarity_not_probability(self):
        careers = [self.career_one]
        result = score_careers(self.user, self.profile, self.skill_links, careers)[0]
        self.assertIn("not the probability of career success", result["explanation"])

    def test_assessment_score_is_included_when_available(self):
        assessment = Assessment(
            user_id=self.user.id,
            assessment_type="skills",
            score=80,
            responses={},
        )
        db.session.add(assessment)
        db.session.commit()

        careers = [self.career_one]
        result = score_careers(self.user, self.profile, self.skill_links, careers)[0]

        self.assertTrue(result["available_factors"]["assessment_score"])
        self.assertAlmostEqual(result["factors"]["assessment_score"], 0.8, places=2)
        self.assertAlmostEqual(result["weights_used"]["assessment_score"], 0.2, places=6)


if __name__ == "__main__":
    unittest.main()

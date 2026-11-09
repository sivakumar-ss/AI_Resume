"""Student profile management and technical-skill API tests.

Runs against in-memory SQLite; no Supabase connection is required. Ownership is
exercised with two separate students so cross-account access is covered.
"""
import unittest

from app import create_app
from app.extensions import db
from app.models.skill import Skill
from app.models.student_profile import StudentProfile
from app.models.student_skill import StudentSkill
from app.models.user import User


class ProfileTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app("testing")
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            db.engine.dispose()

    # ---- helpers ---------------------------------------------------------

    def register_and_token(self, email="student@college.edu", name="Asha Rao"):
        response = self.client.post(
            "/api/auth/register",
            json={
                "email": email,
                "password": "secret123",
                "full_name": name,
            },
        )
        self.assertEqual(response.status_code, 201, response.get_json())
        return response.get_json()["access_token"]

    @staticmethod
    def auth_header(token):
        return {"Authorization": f"Bearer {token}"}

    def get_profile(self, token):
        return self.client.get(
            "/api/profile", headers=self.auth_header(token)
        )

    def update_profile(self, token, method="put", **payload):
        return getattr(self.client, method)(
            "/api/profile",
            headers=self.auth_header(token),
            json=payload,
        )

    def add_skill(self, token, **payload):
        return self.client.post(
            "/api/profile/skills",
            headers=self.auth_header(token),
            json=payload,
        )

    # ---- profile defaults and view --------------------------------------

    def test_profile_defaults_include_requested_fields(self):
        token = self.register_and_token()

        response = self.get_profile(token)

        self.assertEqual(response.status_code, 200)
        profile = response.get_json()
        self.assertEqual(profile["full_name"], "Asha Rao")
        self.assertEqual(profile["education_level"], "undergraduate")
        self.assertEqual(profile["department"], "Undeclared")
        self.assertEqual(profile["branch"], "Undeclared")
        self.assertIsNone(profile["college_name"])
        self.assertEqual(profile["experience_level"], "beginner")
        self.assertEqual(profile["career_interests"], [])
        self.assertEqual(profile["interests"], [])
        self.assertEqual(profile["technical_skills"], [])
        self.assertEqual(profile["graduation_year"], None)

    def test_update_profile_with_all_requested_fields(self):
        token = self.register_and_token()

        response = self.update_profile(
            token,
            full_name="Asha R. Rao",
            education_level="postgraduate",
            department="Data Science",
            college_name="National Institute of Technology",
            graduation_year=2028,
            experience_level="intermediate",
            career_interests=["machine learning", "research"],
            semester=8,
            cgpa=9.25,
            bio="Building ML systems.",
        )

        self.assertEqual(response.status_code, 200)
        profile = response.get_json()
        self.assertEqual(profile["full_name"], "Asha R. Rao")
        self.assertEqual(profile["education_level"], "postgraduate")
        self.assertEqual(profile["department"], "Data Science")
        self.assertEqual(profile["branch"], "Data Science")
        self.assertEqual(
            profile["college_name"], "National Institute of Technology"
        )
        self.assertEqual(profile["graduation_year"], 2028)
        self.assertEqual(profile["experience_level"], "intermediate")
        self.assertEqual(
            profile["career_interests"], ["machine learning", "research"]
        )
        self.assertEqual(
            profile["interests"], ["machine learning", "research"]
        )
        self.assertEqual(profile["semester"], 8)
        self.assertEqual(profile["cgpa"], 9.25)

        # Full name and academic fields persist in the database.
        with self.app.app_context():
            user = db.session.scalar(
                db.select(User).where(User.email == "student@college.edu")
            )
            stored = db.session.scalar(
                db.select(StudentProfile).where(
                    StudentProfile.user_id == user.id
                )
            )
            self.assertEqual(user.full_name, "Asha R. Rao")
            self.assertEqual(stored.branch, "Data Science")
            self.assertEqual(stored.education_level, "postgraduate")
            self.assertEqual(stored.experience_level, "intermediate")
            self.assertEqual(
                stored.college_name, "National Institute of Technology"
            )
            self.assertEqual(stored.graduation_year, 2028)
            self.assertEqual(
                stored.interests, ["machine learning", "research"]
            )

        me = self.client.get(
            "/api/auth/me", headers=self.auth_header(token)
        )
        self.assertEqual(me.get_json()["user"]["full_name"], "Asha R. Rao")

    def test_patch_updates_only_supplied_fields(self):
        token = self.register_and_token()

        self.update_profile(
            token,
            department="Computer Science",
            education_level="undergraduate",
            experience_level="advanced",
            career_interests=["ai"],
        )
        response = self.update_profile(
            token, method="patch", college_name="IIT Example"
        )

        self.assertEqual(response.status_code, 200)
        profile = response.get_json()
        self.assertEqual(profile["college_name"], "IIT Example")
        self.assertEqual(profile["department"], "Computer Science")
        self.assertEqual(profile["education_level"], "undergraduate")
        self.assertEqual(profile["experience_level"], "advanced")
        self.assertEqual(profile["career_interests"], ["ai"])

    def test_legacy_aliases_are_accepted(self):
        token = self.register_and_token()

        response = self.update_profile(
            token, branch="Electronics", interests=["robotics"]
        )

        self.assertEqual(response.status_code, 200)
        profile = response.get_json()
        self.assertEqual(profile["department"], "Electronics")
        self.assertEqual(profile["career_interests"], ["robotics"])

    def test_department_aliases_must_match_when_both_supplied(self):
        token = self.register_and_token()

        response = self.update_profile(
            token, department="Computer Science", branch="Electronics"
        )

        self.assertEqual(response.status_code, 422)
        self.assertIn("department", response.get_json()["fields"])

    def test_career_interest_aliases_must_match_when_both_supplied(self):
        token = self.register_and_token()

        response = self.update_profile(
            token,
            career_interests=["ai"],
            interests=["design"],
        )

        self.assertEqual(response.status_code, 422)
        self.assertIn("career_interests", response.get_json()["fields"])

    def test_profile_validation_rejects_bad_enum_and_ranges(self):
        token = self.register_and_token()

        response = self.update_profile(
            token,
            full_name="A",
            education_level="kindergarten",
            experience_level="expert",
            graduation_year=1990,
            semester=9,
            cgpa=11,
        )

        self.assertEqual(response.status_code, 422)
        fields = response.get_json()["fields"]
        for field in (
            "full_name",
            "education_level",
            "experience_level",
            "graduation_year",
            "semester",
            "cgpa",
        ):
            self.assertIn(field, fields)

    def test_profile_is_scoped_to_the_jwt_owner(self):
        first = self.register_and_token()
        second = self.register_and_token(
            email="second@college.edu", name="Second Student"
        )

        updated = self.update_profile(
            first,
            department="First Department",
            full_name="First Updated",
            user_id=999,
        )
        self.assertEqual(updated.status_code, 200)

        second_profile = self.get_profile(second).get_json()
        self.assertEqual(second_profile["full_name"], "Second Student")
        self.assertEqual(second_profile["department"], "Undeclared")

        first_profile = self.get_profile(first).get_json()
        self.assertEqual(first_profile["full_name"], "First Updated")

    def test_profile_and_skills_require_authentication(self):
        for method, path in (
            ("get", "/api/profile"),
            ("put", "/api/profile"),
            ("get", "/api/profile/skills"),
            ("post", "/api/profile/skills"),
        ):
            response = getattr(self.client, method)(path)
            self.assertEqual(response.status_code, 401, path)
            self.assertEqual(
                response.get_json()["error"], "Authentication required"
            )

    def test_admin_cannot_use_student_profile_apis(self):
        with self.app.app_context():
            from app.services.auth_service import create_admin

            create_admin("admin@college.edu", "adminpass123", "Admin User")

        login = self.client.post(
            "/api/auth/login",
            json={
                "email": "admin@college.edu",
                "password": "adminpass123",
            },
        )
        token = login.get_json()["access_token"]

        responses = (
            self.get_profile(token),
            self.add_skill(token, name="python"),
        )
        for response in responses:
            self.assertEqual(response.status_code, 403)
            self.assertEqual(
                response.get_json()["error"],
                "Student profiles are only available to student accounts",
            )

    # ---- technical skills ------------------------------------------------

    def test_skill_lifecycle(self):
        token = self.register_and_token()

        created = self.add_skill(
            token, name="  Python  ", proficiency_level=4
        )
        self.assertEqual(created.status_code, 201)
        skill = created.get_json()
        self.assertEqual(skill["name"], "python")
        self.assertEqual(skill["category"], "technical")
        self.assertEqual(skill["proficiency_level"], 4)
        link_id = skill["id"]
        skill_id = skill["skill_id"]

        listed = self.client.get(
            "/api/profile/skills", headers=self.auth_header(token)
        )
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(listed.get_json()["total"], 1)
        self.assertEqual(
            listed.get_json()["items"][0]["name"], "python"
        )

        profile = self.get_profile(token).get_json()
        self.assertEqual(len(profile["technical_skills"]), 1)
        self.assertEqual(
            profile["technical_skills"][0]["proficiency_level"], 4
        )

        updated = self.client.patch(
            f"/api/profile/skills/{link_id}",
            headers=self.auth_header(token),
            json={"proficiency_level": 5},
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.get_json()["proficiency_level"], 5)

        removed = self.client.delete(
            f"/api/profile/skills/{link_id}",
            headers=self.auth_header(token),
        )
        self.assertEqual(removed.status_code, 200)
        self.assertEqual(
            removed.get_json()["message"], "Skill removed from profile"
        )
        self.assertEqual(removed.get_json()["student_skill_id"], link_id)

        self.assertEqual(
            self.client.get(
                "/api/profile/skills", headers=self.auth_header(token)
            ).get_json()["total"],
            0,
        )

        with self.app.app_context():
            # The catalogue row remains for other students/careers.
            self.assertIsNotNone(db.session.get(Skill, skill_id))
            self.assertIsNone(db.session.get(StudentSkill, link_id))

    def test_bulk_technical_skills_replace_set_and_keep_proficiency(self):
        token = self.register_and_token()

        response = self.update_profile(
            token, technical_skills=["Python", "SQL", " python "]
        )
        self.assertEqual(response.status_code, 200)
        skills = {
            item["name"]: item
            for item in response.get_json()["technical_skills"]
        }
        self.assertEqual(set(skills), {"python", "sql"})
        self.assertEqual(skills["python"]["proficiency_level"], 3)

        patched = self.client.patch(
            f"/api/profile/skills/{skills['python']['id']}",
            headers=self.auth_header(token),
            json={"proficiency_level": 5},
        )
        self.assertEqual(patched.status_code, 200)

        replaced = self.update_profile(
            token, method="patch", technical_skills=["Python", "Go"]
        )
        self.assertEqual(replaced.status_code, 200)
        skills = {
            item["name"]: item
            for item in replaced.get_json()["technical_skills"]
        }
        self.assertEqual(set(skills), {"python", "go"})
        self.assertEqual(skills["python"]["proficiency_level"], 5)
        self.assertEqual(skills["go"]["proficiency_level"], 3)

        cleared = self.update_profile(
            token, method="patch", technical_skills=[]
        )
        self.assertEqual(cleared.status_code, 200)
        self.assertEqual(cleared.get_json()["technical_skills"], [])

        with self.app.app_context():
            # Catalogue rows are not removed by a profile-level replacement.
            names = set(
                db.session.scalars(db.select(Skill.name)).all()
            )
            self.assertTrue({"python", "sql", "go"}.issubset(names))

    def test_bulk_technical_skills_validation(self):
        token = self.register_and_token()

        response = self.update_profile(
            token, technical_skills=["Python", 42]
        )

        self.assertEqual(response.status_code, 422)
        self.assertIn(
            "technical_skills", response.get_json()["fields"]
        )

    def test_skill_name_is_reused_across_students(self):
        first = self.register_and_token()
        second = self.register_and_token(
            email="second@college.edu", name="Second Student"
        )

        first_skill = self.add_skill(
            first, name="Python", proficiency_level=5
        ).get_json()
        second_skill = self.add_skill(
            second, name="python", proficiency_level=2
        ).get_json()

        self.assertEqual(first_skill["skill_id"], second_skill["skill_id"])
        self.assertNotEqual(first_skill["id"], second_skill["id"])

        with self.app.app_context():
            self.assertEqual(
                db.session.scalar(
                    db.select(db.func.count()).select_from(Skill)
                ),
                1,
            )

    def test_duplicate_skill_for_same_student_is_409(self):
        token = self.register_and_token()
        self.add_skill(token, name="Python")

        duplicate = self.add_skill(token, name="  PYTHON ")

        self.assertEqual(duplicate.status_code, 409)
        self.assertEqual(
            duplicate.get_json()["error"],
            "Skill is already in your profile",
        )

    def test_skill_validation_and_defaults(self):
        token = self.register_and_token()

        defaulted = self.add_skill(token, name="SQL")
        self.assertEqual(defaulted.status_code, 201)
        self.assertEqual(defaulted.get_json()["proficiency_level"], 3)

        missing_name = self.add_skill(token, proficiency_level=4)
        self.assertEqual(missing_name.status_code, 422)
        self.assertEqual(
            missing_name.get_json()["fields"]["name"], "is required"
        )

        invalid_level = self.add_skill(
            token, name="Go", proficiency_level=6
        )
        self.assertEqual(invalid_level.status_code, 422)
        self.assertIn("proficiency_level", invalid_level.get_json()["fields"])

        too_long = self.add_skill(token, name="x" * 101)
        self.assertEqual(too_long.status_code, 422)
        self.assertIn("name", too_long.get_json()["fields"])

    def test_skill_update_validation(self):
        token = self.register_and_token()
        link = self.add_skill(token, name="Python").get_json()

        invalid = self.client.patch(
            f"/api/profile/skills/{link['id']}",
            headers=self.auth_header(token),
            json={"proficiency_level": 0},
        )
        self.assertEqual(invalid.status_code, 422)
        self.assertIn(
            "proficiency_level", invalid.get_json()["fields"]
        )

        missing = self.client.patch(
            f"/api/profile/skills/{link['id']}",
            headers=self.auth_header(token),
            json={},
        )
        self.assertEqual(missing.status_code, 422)
        self.assertEqual(
            missing.get_json()["fields"]["proficiency_level"],
            "is required",
        )

    def test_skill_links_are_owner_scoped(self):
        first = self.register_and_token()
        second = self.register_and_token(
            email="second@college.edu", name="Second Student"
        )

        first_skill = self.add_skill(
            first, name="Python", proficiency_level=5
        ).get_json()
        second_skill = self.add_skill(
            second, name="Python", proficiency_level=2
        ).get_json()

        # The first student cannot update or delete the second student's link.
        update = self.client.patch(
            f"/api/profile/skills/{second_skill['id']}",
            headers=self.auth_header(first),
            json={"proficiency_level": 1},
        )
        self.assertEqual(update.status_code, 404)
        self.assertEqual(
            update.get_json()["error"], "Skill not found in your profile"
        )

        delete = self.client.delete(
            f"/api/profile/skills/{second_skill['id']}",
            headers=self.auth_header(first),
        )
        self.assertEqual(delete.status_code, 404)

        second_list = self.client.get(
            "/api/profile/skills", headers=self.auth_header(second)
        ).get_json()
        self.assertEqual(second_list["total"], 1)
        self.assertEqual(
            second_list["items"][0]["proficiency_level"], 2
        )

        # Deleting the first student's own link leaves the second link intact.
        own_delete = self.client.delete(
            f"/api/profile/skills/{first_skill['id']}",
            headers=self.auth_header(first),
        )
        self.assertEqual(own_delete.status_code, 200)

        second_list = self.client.get(
            "/api/profile/skills", headers=self.auth_header(second)
        ).get_json()
        self.assertEqual(second_list["total"], 1)

    def test_unknown_skill_link_returns_404(self):
        token = self.register_and_token()

        update = self.client.patch(
            "/api/profile/skills/999999",
            headers=self.auth_header(token),
            json={"proficiency_level": 4},
        )
        self.assertEqual(update.status_code, 404)

        delete = self.client.delete(
            "/api/profile/skills/999999",
            headers=self.auth_header(token),
        )
        self.assertEqual(delete.status_code, 404)


if __name__ == "__main__":
    unittest.main()

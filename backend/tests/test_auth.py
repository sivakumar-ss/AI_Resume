"""Authentication and authorization API tests.

These tests run against an in-memory SQLite database; no Supabase connection is
required. They cover registration, login, token handling, logout invalidation,
role enforcement and profile ownership.
"""
import unittest
from datetime import timedelta

from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash

from app import create_app
from app.extensions import db
from app.models.student_profile import StudentProfile
from app.models.user import User


class AuthTestCase(unittest.TestCase):
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

    def register(self, **overrides):
        payload = {
            "email": "student@college.edu",
            "password": "secret123",
            "full_name": "Asha Rao",
        }
        payload.update(overrides)
        return self.client.post("/api/auth/register", json=payload)

    def login(self, email="student@college.edu", password="secret123"):
        return self.client.post(
            "/api/auth/login", json={"email": email, "password": password}
        )

    @staticmethod
    def auth_header(token):
        return {"Authorization": f"Bearer {token}"}

    def register_and_token(self, **overrides):
        response = self.register(**overrides)
        self.assertEqual(response.status_code, 201, response.get_json())
        return response.get_json()["access_token"]

    # ---- registration ----------------------------------------------------

    def test_register_creates_student_profile_with_hashed_password(self):
        response = self.register()

        self.assertEqual(response.status_code, 201)
        body = response.get_json()
        self.assertIn("access_token", body)
        self.assertEqual(body["token_type"], "Bearer")
        self.assertEqual(body["user"]["email"], "student@college.edu")
        self.assertEqual(body["user"]["role"], "student")
        self.assertNotIn("password_hash", body["user"])
        self.assertNotIn("token_version", body["user"])

        self.assertEqual(body["profile"]["branch"], "Undeclared")
        self.assertEqual(body["profile"]["semester"], 1)
        self.assertEqual(body["profile"]["interests"], [])
        self.assertIsNone(body["profile"]["cgpa"])

        with self.app.app_context():
            user = db.session.scalar(
                db.select(User).where(User.email == "student@college.edu")
            )
            self.assertIsNotNone(user)
            self.assertNotEqual(user.password_hash, "secret123")
            self.assertNotIn("secret123", user.password_hash)
            self.assertTrue(user.password_hash.startswith("scrypt:"))
            self.assertTrue(check_password_hash(user.password_hash, "secret123"))
            self.assertTrue(user.is_active)

            profile = db.session.scalar(
                db.select(StudentProfile).where(StudentProfile.user_id == user.id)
            )
            self.assertIsNotNone(profile)
            self.assertEqual(profile.branch, "Undeclared")
            self.assertEqual(profile.semester, 1)

    def test_register_accepts_optional_academic_fields(self):
        response = self.register(
            branch="Computer Science",
            semester=6,
            cgpa=8.75,
            graduation_year=2027,
            bio="Interested in machine learning.",
            interests=["AI", "data science"],
        )

        self.assertEqual(response.status_code, 201)
        profile = response.get_json()["profile"]
        self.assertEqual(profile["branch"], "Computer Science")
        self.assertEqual(profile["semester"], 6)
        self.assertEqual(profile["cgpa"], 8.75)
        self.assertEqual(profile["graduation_year"], 2027)
        self.assertEqual(profile["bio"], "Interested in machine learning.")
        self.assertEqual(profile["interests"], ["AI", "data science"])

    def test_register_ignores_client_supplied_role(self):
        token = self.register_and_token(role="admin")

        with self.app.app_context():
            user = db.session.scalar(
                db.select(User).where(User.email == "student@college.edu")
            )
            self.assertEqual(user.role, "student")

        response = self.client.get(
            "/api/admin/stats", headers=self.auth_header(token)
        )
        self.assertEqual(response.status_code, 403)

    def test_register_duplicate_email_is_409_case_insensitive(self):
        first = self.register(email="Student@College.EDU")
        self.assertEqual(first.status_code, 201)

        duplicate = self.register(email="student@college.edu")
        self.assertEqual(duplicate.status_code, 409)
        self.assertEqual(
            duplicate.get_json()["error"],
            "An account with this email already exists",
        )

        with self.app.app_context():
            count = db.session.scalar(
                db.select(db.func.count()).select_from(User)
            )
            self.assertEqual(count, 1)

    def test_register_validation_reports_all_invalid_fields(self):
        response = self.client.post(
            "/api/auth/register",
            json={
                "email": "not-an-email",
                "password": "short",
                "full_name": "A",
                "semester": 9,
            },
        )

        self.assertEqual(response.status_code, 422)
        body = response.get_json()
        self.assertEqual(body["error"], "Validation failed")
        self.assertIn("email", body["fields"])
        self.assertIn("password", body["fields"])
        self.assertIn("full_name", body["fields"])
        self.assertIn("semester", body["fields"])

        with self.app.app_context():
            count = db.session.scalar(
                db.select(db.func.count()).select_from(User)
            )
            self.assertEqual(count, 0)

    def test_register_rejects_invalid_interests(self):
        response = self.register(interests=["AI", 42])

        self.assertEqual(response.status_code, 422)
        self.assertEqual(
            response.get_json()["fields"]["interests"],
            "item 2 must be a string",
        )

    def test_register_requires_json_content_type(self):
        response = self.client.post("/api/auth/register", data="not json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json()["error"],
            "Content-Type must be application/json",
        )

    def test_register_response_never_leaks_password_material(self):
        response = self.register()
        raw = response.get_data(as_text=True)

        self.assertNotIn("password_hash", raw)
        self.assertNotIn("secret123", raw)
        self.assertNotIn("token_version", raw)

    # ---- login -----------------------------------------------------------

    def test_login_returns_token_and_profile(self):
        self.register()

        response = self.login(email="  Student@College.EDU  ")

        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertIn("access_token", body)
        self.assertEqual(body["user"]["role"], "student")
        self.assertEqual(body["profile"]["branch"], "Undeclared")
        self.assertNotIn("password_hash", response.get_data(as_text=True))

        me = self.client.get(
            "/api/auth/me", headers=self.auth_header(body["access_token"])
        )
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.get_json()["user"]["email"], "student@college.edu")

    def test_login_wrong_password_and_unknown_email_are_indistinguishable(self):
        self.register()

        wrong_password = self.login(password="wrong-password")
        unknown_email = self.login(email="nobody@college.edu")

        for response in (wrong_password, unknown_email):
            self.assertEqual(response.status_code, 401)
            self.assertEqual(
                response.get_json()["error"], "Invalid email or password"
            )

    def test_login_inactive_account_returns_403(self):
        self.register()
        with self.app.app_context():
            user = db.session.scalar(
                db.select(User).where(User.email == "student@college.edu")
            )
            user.is_active = False
            db.session.commit()

        response = self.login()

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.get_json()["error"], "This account has been deactivated"
        )

    def test_login_validation_requires_email_and_password(self):
        response = self.client.post("/api/auth/login", json={})

        self.assertEqual(response.status_code, 422)
        fields = response.get_json()["fields"]
        self.assertEqual(fields["email"], "is required")
        self.assertEqual(fields["password"], "is required")

    # ---- protected endpoints and tokens ----------------------------------

    def test_protected_endpoint_requires_token(self):
        response = self.client.get("/api/auth/me")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"], "Authentication required")

    def test_invalid_token_is_rejected(self):
        response = self.client.get(
            "/api/auth/me", headers={"Authorization": "Bearer not-a-real-token"}
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(
            response.get_json()["error"], "Invalid authentication token"
        )

    def test_expired_token_is_rejected(self):
        self.register()
        with self.app.app_context():
            token = create_access_token(
                identity="1",
                additional_claims={"role": "student", "ver": 0},
                expires_delta=timedelta(seconds=-1),
            )

        response = self.client.get(
            "/api/auth/me", headers=self.auth_header(token)
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(
            response.get_json()["error"], "Authentication token has expired"
        )

    def test_me_returns_user_and_profile(self):
        token = self.register_and_token(
            branch="Electronics", semester=4, interests=["robotics"]
        )

        response = self.client.get(
            "/api/auth/me", headers=self.auth_header(token)
        )

        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertEqual(body["user"]["full_name"], "Asha Rao")
        self.assertEqual(body["profile"]["branch"], "Electronics")
        self.assertEqual(body["profile"]["semester"], 4)
        self.assertEqual(body["profile"]["interests"], ["robotics"])

    def test_deactivated_user_token_is_rejected(self):
        token = self.register_and_token()
        with self.app.app_context():
            user = db.session.scalar(
                db.select(User).where(User.email == "student@college.edu")
            )
            user.is_active = False
            db.session.commit()

        response = self.client.get(
            "/api/auth/me", headers=self.auth_header(token)
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(
            response.get_json()["error"], "Authentication token has been revoked"
        )

    # ---- browser cookie session ------------------------------------------

    def csrf_headers(self):
        cookie = self.client.get_cookie("career_csrf_token")
        self.assertIsNotNone(cookie, "CSRF cookie was not set")
        return {"X-CSRF-TOKEN": cookie.value}

    def test_login_sets_httponly_access_cookie_and_readable_csrf_cookie(self):
        response = self.register()

        set_cookies = response.headers.getlist("Set-Cookie")
        access_cookie = next(
            (cookie for cookie in set_cookies if cookie.startswith("career_access_token=")),
            "",
        )
        csrf_cookie = next(
            (cookie for cookie in set_cookies if cookie.startswith("career_csrf_token=")),
            "",
        )

        self.assertIn("HttpOnly", access_cookie)
        self.assertIn("SameSite=Lax", access_cookie)
        self.assertIn("Path=/api", access_cookie)
        self.assertTrue(csrf_cookie)
        self.assertNotIn("HttpOnly", csrf_cookie)

    def test_cookie_session_authenticates_requests(self):
        self.register()

        response = self.client.get("/api/auth/me")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["user"]["email"], "student@college.edu")

    def test_cookie_mutations_require_csrf_header(self):
        self.register()

        missing_csrf = self.client.patch("/api/profile", json={"semester": 4})
        self.assertEqual(missing_csrf.status_code, 401)
        self.assertEqual(self.client.get("/api/profile").get_json()["semester"], 1)

        allowed = self.client.patch(
            "/api/profile",
            headers=self.csrf_headers(),
            json={"semester": 4},
        )
        self.assertEqual(allowed.status_code, 200)
        self.assertEqual(allowed.get_json()["semester"], 4)

    def test_cookie_logout_revokes_token_and_clears_cookies(self):
        self.register()

        logout = self.client.post("/api/auth/logout", headers=self.csrf_headers())

        self.assertEqual(logout.status_code, 200)
        self.assertIsNone(
            self.client.get_cookie("career_access_token", path="/api")
        )
        self.assertIsNone(self.client.get_cookie("career_csrf_token"))
        self.assertEqual(self.client.get("/api/auth/me").status_code, 401)

    # ---- logout / token invalidation -------------------------------------

    def test_logout_invalidates_all_existing_tokens(self):
        self.register()
        first = self.login().get_json()["access_token"]
        second = self.login().get_json()["access_token"]

        logout = self.client.post(
            "/api/auth/logout", headers=self.auth_header(first)
        )
        self.assertEqual(logout.status_code, 200)
        self.assertEqual(
            logout.get_json()["message"], "Logged out successfully"
        )

        for token in (first, second):
            response = self.client.get(
                "/api/auth/me", headers=self.auth_header(token)
            )
            self.assertEqual(response.status_code, 401)
            self.assertEqual(
                response.get_json()["error"],
                "Authentication token has been revoked",
            )

        with self.app.app_context():
            user = db.session.scalar(
                db.select(User).where(User.email == "student@college.edu")
            )
            self.assertEqual(user.token_version, 1)

    def test_login_after_logout_issues_a_working_token(self):
        self.register()
        old_token = self.login().get_json()["access_token"]
        self.client.post("/api/auth/logout", headers=self.auth_header(old_token))

        response = self.login()
        self.assertEqual(response.status_code, 200)
        new_token = response.get_json()["access_token"]

        me = self.client.get("/api/auth/me", headers=self.auth_header(new_token))
        self.assertEqual(me.status_code, 200)

    def test_logout_requires_authentication(self):
        response = self.client.post("/api/auth/logout")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"], "Authentication required")

    # ---- profile ownership -----------------------------------------------

    def test_profile_can_be_read_and_updated_by_owner(self):
        token = self.register_and_token()

        read = self.client.get(
            "/api/profile", headers=self.auth_header(token)
        )
        self.assertEqual(read.status_code, 200)
        self.assertEqual(read.get_json()["branch"], "Undeclared")

        update = self.client.put(
            "/api/profile",
            headers=self.auth_header(token),
            json={
                "branch": "Computer Science",
                "semester": 5,
                "cgpa": 9.1,
                "graduation_year": 2028,
                "bio": "Aspiring ML engineer.",
                "interests": ["AI", "python"],
            },
        )
        self.assertEqual(update.status_code, 200)
        body = update.get_json()
        self.assertEqual(body["branch"], "Computer Science")
        self.assertEqual(body["semester"], 5)
        self.assertEqual(body["cgpa"], 9.1)
        self.assertEqual(body["graduation_year"], 2028)
        self.assertEqual(body["bio"], "Aspiring ML engineer.")
        self.assertEqual(body["interests"], ["AI", "python"])

        patch = self.client.patch(
            "/api/profile",
            headers=self.auth_header(token),
            json={"semester": 6},
        )
        self.assertEqual(patch.status_code, 200)
        self.assertEqual(patch.get_json()["semester"], 6)
        self.assertEqual(patch.get_json()["branch"], "Computer Science")

    def test_profile_updates_are_scoped_to_the_token_owner(self):
        first_token = self.register_and_token()
        second_token = self.register_and_token(
            email="second@college.edu", full_name="Second Student"
        )

        update = self.client.put(
            "/api/profile",
            headers=self.auth_header(first_token),
            json={"branch": "First Branch", "semester": 7},
        )
        self.assertEqual(update.status_code, 200)

        second = self.client.get(
            "/api/profile", headers=self.auth_header(second_token)
        )
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second.get_json()["branch"], "Undeclared")
        self.assertEqual(second.get_json()["semester"], 1)

    def test_profile_rejects_invalid_values(self):
        token = self.register_and_token()

        response = self.client.patch(
            "/api/profile",
            headers=self.auth_header(token),
            json={"semester": 0, "cgpa": 11},
        )

        self.assertEqual(response.status_code, 422)
        fields = response.get_json()["fields"]
        self.assertIn("semester", fields)
        self.assertIn("cgpa", fields)

    def test_profile_requires_authentication(self):
        response = self.client.get("/api/profile")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"], "Authentication required")

    # ---- roles -----------------------------------------------------------

    def test_student_cannot_access_admin_endpoint(self):
        token = self.register_and_token()

        response = self.client.get(
            "/api/admin/stats", headers=self.auth_header(token)
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.get_json()["error"],
            "You do not have permission to access this resource",
        )

    def test_admin_can_login_and_read_aggregate_stats(self):
        self.register()
        self.register(email="second@college.edu", full_name="Second Student")

        with self.app.app_context():
            from app.services.auth_service import create_admin

            create_admin("admin@college.edu", "adminpass123", "Admin User")

        login = self.login(email="admin@college.edu", password="adminpass123")
        self.assertEqual(login.status_code, 200)
        self.assertEqual(login.get_json()["user"]["role"], "admin")
        token = login.get_json()["access_token"]

        response = self.client.get(
            "/api/admin/stats", headers=self.auth_header(token)
        )

        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertEqual(body["users"]["total"], 3)
        self.assertEqual(body["users"]["students"], 2)
        self.assertEqual(body["users"]["admins"], 1)
        self.assertEqual(body["profiles"], 2)
        self.assertEqual(body["careers"], 0)
        self.assertNotIn("password_hash", response.get_data(as_text=True))

    def test_admin_cannot_access_student_profile(self):
        with self.app.app_context():
            from app.services.auth_service import create_admin

            create_admin("admin@college.edu", "adminpass123", "Admin User")

        token = self.login(
            email="admin@college.edu", password="adminpass123"
        ).get_json()["access_token"]

        response = self.client.get(
            "/api/profile", headers=self.auth_header(token)
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.get_json()["error"],
            "Student profiles are only available to student accounts",
        )

    def test_create_admin_cli_creates_an_admin(self):
        runner = self.app.test_cli_runner()
        result = runner.invoke(
            args=[
                "create-admin",
                "--email",
                "admin@college.edu",
                "--full-name",
                "Admin User",
                "--password",
                "adminpass123",
            ]
        )

        self.assertEqual(result.exit_code, 0, result.output)
        self.assertIn("Admin account created", result.output)

        with self.app.app_context():
            user = db.session.scalar(
                db.select(User).where(User.email == "admin@college.edu")
            )
            self.assertIsNotNone(user)
            self.assertEqual(user.role, "admin")
            self.assertTrue(check_password_hash(user.password_hash, "adminpass123"))


if __name__ == "__main__":
    unittest.main()

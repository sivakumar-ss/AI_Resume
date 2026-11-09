"""Backend foundation tests (stdlib unittest — no extra dependencies)."""
import unittest

from flask import jsonify
from sqlalchemy.exc import IntegrityError, OperationalError

from app import create_app
from app.extensions import db
from app.utils.validation import Validator, get_json_body


def _build_test_app():
    """Create a testing app plus a few internal routes for validation tests."""
    app = create_app("testing")

    @app.post("/api/_test/validate")
    def _test_validate():
        validator = Validator(get_json_body())
        validator.email("email")
        validator.string("full_name", min_length=2, max_length=120)
        validator.password("password", min_length=8)
        validator.integer("age", min_value=16, max_value=100, required=False)
        validator.boolean("newsletter", default=False)
        return jsonify(validator.done())

    @app.get("/api/_test/operational-error")
    def _test_operational_error():
        raise OperationalError("SELECT 1", {}, Exception("simulated outage"))

    @app.get("/api/_test/integrity-error")
    def _test_integrity_error():
        raise IntegrityError("INSERT", {}, Exception("simulated duplicate"))

    return app


class BackendTestCase(unittest.TestCase):
    def setUp(self):
        self.app = _build_test_app()
        self.client = self.app.test_client()
        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            db.engine.dispose()

    # ---- health ----------------------------------------------------------

    def test_health_is_ok(self):
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertEqual(body["status"], "ok")
        self.assertEqual(body["service"], "career-guidance-api")
        self.assertIn("version", body)

    def test_database_health_is_ok(self):
        response = self.client.get("/api/health/db")

        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertEqual(body["status"], "ok")
        self.assertEqual(body["database"], "connected")
        self.assertEqual(body["dialect"], "sqlite")
        self.assertGreaterEqual(body["latency_ms"], 0)
        self.assertNotIn("server_version", body)

    def test_database_health_verbose(self):
        response = self.client.get("/api/health/db?verbose=true")

        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertEqual(body["status"], "ok")
        self.assertIn("server_version", body)

    def test_database_health_rejects_invalid_query(self):
        response = self.client.get("/api/health/db?verbose=maybe")

        self.assertEqual(response.status_code, 422)
        body = response.get_json()
        self.assertEqual(body["error"], "Validation failed")
        self.assertEqual(body["fields"]["verbose"], "must be a boolean")

    # ---- HTTP errors -----------------------------------------------------

    def test_unknown_route_returns_json_404(self):
        response = self.client.get("/api/does-not-exist")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json(), {"error": "Not found"})

    def test_wrong_method_returns_json_405(self):
        response = self.client.post("/api/health")

        self.assertEqual(response.status_code, 405)
        self.assertEqual(response.get_json(), {"error": "Method not allowed"})

    # ---- CORS ------------------------------------------------------------

    def test_cors_preflight_allows_configured_frontend_with_credentials(self):
        response = self.client.options(
            "/api/auth/login",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type,x-csrf-token",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers.get("Access-Control-Allow-Origin"),
            "http://localhost:5173",
        )
        self.assertEqual(
            response.headers.get("Access-Control-Allow-Credentials"), "true"
        )
        self.assertIn(
            "x-csrf-token",
            response.headers.get("Access-Control-Allow-Headers", "").lower(),
        )

    def test_cors_does_not_allow_unconfigured_origins(self):
        response = self.client.get(
            "/api/health", headers={"Origin": "https://evil.example"}
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("Access-Control-Allow-Origin", response.headers)

    # ---- validation ------------------------------------------------------

    def test_validation_reports_all_invalid_fields(self):
        response = self.client.post(
            "/api/_test/validate",
            json={"email": "not-an-email"},
        )

        self.assertEqual(response.status_code, 422)
        body = response.get_json()
        self.assertEqual(body["error"], "Validation failed")
        self.assertEqual(
            body["fields"]["email"], "must be a valid email address"
        )
        self.assertEqual(body["fields"]["full_name"], "is required")
        self.assertEqual(body["fields"]["password"], "is required")

    def test_validation_accepts_and_normalizes_valid_payload(self):
        response = self.client.post(
            "/api/_test/validate",
            json={
                "email": "Student@College.EDU",
                "full_name": "  Asha Rao  ",
                "password": "secret123",
                "age": "20",
                "newsletter": "yes",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {
                "email": "student@college.edu",
                "full_name": "Asha Rao",
                "password": "secret123",
                "age": 20,
                "newsletter": True,
            },
        )

    def test_validation_defaults_optional_fields(self):
        response = self.client.post(
            "/api/_test/validate",
            json={
                "email": "student@college.edu",
                "full_name": "Asha Rao",
                "password": "secret123",
            },
        )

        self.assertEqual(response.status_code, 200)
        body = response.get_json()
        self.assertFalse(body["newsletter"])
        self.assertNotIn("age", body)

    def test_validation_rejects_short_password_and_bad_integer(self):
        response = self.client.post(
            "/api/_test/validate",
            json={
                "email": "student@college.edu",
                "full_name": "Asha Rao",
                "password": "short",
                "age": True,
            },
        )

        self.assertEqual(response.status_code, 422)
        fields = response.get_json()["fields"]
        self.assertIn("at least 8", fields["password"])
        self.assertEqual(fields["age"], "must be an integer")

    def test_malformed_json_is_a_400(self):
        response = self.client.post(
            "/api/_test/validate",
            data="{not-json",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json()["error"], "Malformed or empty JSON body")

    def test_non_json_content_type_is_a_400(self):
        response = self.client.post("/api/_test/validate", data="{}")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json()["error"],
            "Content-Type must be application/json",
        )

    def test_json_array_is_a_400(self):
        response = self.client.post("/api/_test/validate", json=["not", "an", "object"])

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json()["error"],
            "Request body must be a JSON object",
        )

    # ---- database errors -------------------------------------------------

    def test_operational_error_returns_503(self):
        response = self.client.get("/api/_test/operational-error")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.get_json(), {"error": "Database is unavailable"})

    def test_integrity_error_returns_409(self):
        response = self.client.get("/api/_test/integrity-error")

        self.assertEqual(response.status_code, 409)
        self.assertEqual(
            response.get_json(),
            {"error": "The request conflicts with existing data"},
        )


if __name__ == "__main__":
    unittest.main()

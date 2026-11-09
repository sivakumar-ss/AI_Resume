"""
Flask application factory for the AI-Powered Career Guidance API.

Wires up extensions (SQLAlchemy, JWT, CORS), blueprints and centralized error
handlers. Feature code lives in routes/services; models own persistence.
"""
import glob
import os
from pathlib import Path

from flask import Flask
from flask_cors import CORS

from app.cli import register_cli
from app.config import get_config
from app.extensions import db, jwt
from app.routes import register_blueprints
from app.utils.auth import register_jwt_callbacks
from app.utils.errors import register_error_handlers


def _ensure_libpq_on_path():
    """Make a trusted system libpq discoverable for psycopg.

    Windows Smart App Control can block the unsigned native DLLs that ship
    inside psycopg-binary. psycopg then falls back to its pure-Python
    implementation, which loads ``libpq.dll`` from PATH — and the copy that
    ships with PostgreSQL is trusted by application control, so point PATH at
    it before SQLAlchemy creates the database engine.
    """
    if os.name != "nt" or Path("libpq.dll").exists():
        return
    if any(
        Path(directory, "libpq.dll").is_file()
        for directory in os.environ.get("PATH", "").split(os.pathsep)
    ):
        return

    for bin_dir in sorted(glob.glob(r"C:\Program Files\PostgreSQL\*\bin"), reverse=True):
        if Path(bin_dir, "libpq.dll").is_file():
            os.environ["PATH"] = bin_dir + os.pathsep + os.environ.get("PATH", "")
            break


def create_app(config_name=None, config_overrides=None):
    """Create and configure the Flask application."""
    _ensure_libpq_on_path()

    app = Flask(__name__)
    app.config.from_object(get_config(config_name))
    if config_overrides:
        app.config.update(config_overrides)

    # Keep JSON key order stable in responses (easier for humans and tests).
    app.json.sort_keys = bool(app.config.get("JSON_SORT_KEYS", False))

    # Import every model before SQLAlchemy metadata is used (create_all, etc.).
    from app import models  # noqa: F401

    _register_extensions(app)
    register_blueprints(app)
    register_error_handlers(app)
    register_cli(app)

    return app


def _register_extensions(app):
    """Attach Flask extensions to the app instance."""
    db.init_app(app)
    jwt.init_app(app)
    # Token revocation is DB-backed (users.token_version), so callbacks are
    # registered after init_app but before the first request.
    register_jwt_callbacks(jwt)
    # The browser sends the HttpOnly JWT cookie, so credentials and the CSRF
    # header must be explicitly allowed for cross-origin deployments.
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
        allow_headers=["Accept", "Authorization", "Content-Type", "X-CSRF-TOKEN"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        max_age=600,
    )

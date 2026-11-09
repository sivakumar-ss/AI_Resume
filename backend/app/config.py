"""
Application configuration loaded from environment variables.

Real values live in backend/.env (git-ignored). The templates in
backend/.env.example document every supported variable.
"""
import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

# Always load backend/.env, regardless of the directory the process starts in.
_BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(_BACKEND_DIR / ".env")


def _first_env(*names, default=None):
    """Return the first non-empty environment variable from *names*."""
    for name in names:
        value = os.getenv(name)
        if value:
            return value
    return default


def _as_int(name, default):
    """Read an integer env var, falling back to *default* when invalid."""
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def _as_bool(name, default=False):
    """Read a boolean env var using common truthy values."""
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _normalize_database_url(uri):
    """Ensure PostgreSQL URLs use the installed psycopg 3 driver."""
    if not uri:
        return uri
    if uri.startswith("postgresql://"):
        return "postgresql+psycopg://" + uri[len("postgresql://") :]
    if uri.startswith("postgres://"):
        return "postgresql+psycopg://" + uri[len("postgres://") :]
    return uri


def _engine_options(uri):
    """Pool settings appropriate for the configured database."""
    if uri.startswith("sqlite"):
        # SQLite uses its own pool implementation; PostgreSQL-only options
        # such as pool_size would raise TypeError here.
        return {"pool_pre_ping": True}

    options = {
        "pool_pre_ping": True,
        "pool_recycle": _as_int("DB_POOL_RECYCLE_SECONDS", 300),
        "pool_size": _as_int("DB_POOL_SIZE", 5),
        "max_overflow": _as_int("DB_MAX_OVERFLOW", 5),
        "pool_timeout": _as_int("DB_POOL_TIMEOUT_SECONDS", 30),
        "connect_args": {
            "connect_timeout": _as_int("DB_CONNECT_TIMEOUT_SECONDS", 10),
        },
    }
    if ":6543/" in uri:
        # Supavisor transaction mode: a statement may run on a different
        # backend connection, so disable psycopg client-side prepared
        # statements. (Prisma's "?pgbouncer=true" is not a psycopg option.)
        options["connect_args"]["prepare_threshold"] = None
    return options


_DATABASE_URI = _normalize_database_url(
    _first_env(
        "SUPABASE_DB_URL",
        "DATABASE_URL",
        default="sqlite:///career_guidance.db",
    )
)

# Session-mode pooler (port 5432), used for schema creation and migrations.
_DIRECT_URI = _normalize_database_url(
    _first_env("SUPABASE_DIRECT_URL", "DIRECT_URL")
)


class BaseConfig:
    """Configuration shared by every environment."""

    ENV_NAME = "base"
    DEBUG = False
    TESTING = False
    APP_VERSION = os.getenv("APP_VERSION", "1.0.0")

    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")

    # ---- Database -------------------------------------------------------
    SQLALCHEMY_DATABASE_URI = _DATABASE_URI
    SQLALCHEMY_DIRECT_URI = _DIRECT_URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = _engine_options(_DATABASE_URI)

    # ---- JWT ------------------------------------------------------------
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-change-me")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=_as_int("JWT_ACCESS_TOKEN_EXPIRES", 3600)
    )
    # Browser sessions use an HttpOnly cookie; API clients may still send a
    # standard Bearer header. Cookies require a matching CSRF token for every
    # state-changing request (double-submit protection).
    JWT_TOKEN_LOCATION = ["headers", "cookies"]
    JWT_ACCESS_COOKIE_NAME = os.getenv(
        "JWT_ACCESS_COOKIE_NAME", "career_access_token"
    )
    JWT_ACCESS_COOKIE_PATH = os.getenv("JWT_ACCESS_COOKIE_PATH", "/api")
    JWT_ACCESS_CSRF_COOKIE_NAME = os.getenv(
        "JWT_ACCESS_CSRF_COOKIE_NAME", "career_csrf_token"
    )
    JWT_ACCESS_CSRF_COOKIE_PATH = "/"
    JWT_COOKIE_CSRF_PROTECT = _as_bool("JWT_COOKIE_CSRF_PROTECT", True)
    JWT_COOKIE_SECURE = _as_bool("JWT_COOKIE_SECURE", False)
    JWT_COOKIE_SAMESITE = os.getenv("JWT_COOKIE_SAMESITE", "Lax")
    JWT_COOKIE_DOMAIN = os.getenv("JWT_COOKIE_DOMAIN") or None
    # Persistent for the token lifetime (not just the browser session).
    JWT_SESSION_COOKIE = _as_bool("JWT_SESSION_COOKIE", False)
    # Return {"error": "..."} instead of the default {"msg": "..."}.
    JWT_ERROR_MESSAGE_KEY = "error"

    # ---- HTTP -----------------------------------------------------------
    CORS_ORIGINS = [
        origin.strip().rstrip("/")
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]
    JSON_SORT_KEYS = False
    API_HOST = os.getenv("API_HOST", "127.0.0.1")
    API_PORT = _as_int("API_PORT", _as_int("PORT", 5000))


class DevelopmentConfig(BaseConfig):
    """Local development: debugger and reloader enabled by run.py."""

    ENV_NAME = "development"
    DEBUG = True


class TestingConfig(BaseConfig):
    """Isolated tests: in-memory SQLite, no Supabase connection."""

    ENV_NAME = "testing"
    TESTING = True
    DEBUG = False
    SECRET_KEY = "testing-secret-key"
    JWT_SECRET_KEY = "testing-jwt-secret-key-long-enough-for-hs256"
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_ENGINE_OPTIONS = {}


class ProductionConfig(BaseConfig):
    """Production deployment (secrets must come from the environment)."""

    ENV_NAME = "production"
    DEBUG = False
    # HTTPS-only cookies unless the deployment explicitly opts out.
    JWT_COOKIE_SECURE = _as_bool("JWT_COOKIE_SECURE", True)


_CONFIGS = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
_ALIASES = {"dev": "development", "test": "testing", "prod": "production"}


def get_config(config_name=None):
    """Return the config class for the requested environment.

    Resolution order: explicit argument, FLASK_ENV, APP_ENV, development.
    """
    name = (
        config_name
        or os.getenv("FLASK_ENV")
        or os.getenv("APP_ENV")
        or "development"
    ).strip().lower()
    name = _ALIASES.get(name, name)

    if name not in _CONFIGS:
        valid = ", ".join(sorted(_CONFIGS))
        raise ValueError(f"Unknown environment '{name}'. Expected one of: {valid}.")

    return _CONFIGS[name]

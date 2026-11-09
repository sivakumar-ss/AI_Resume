"""Service-layer health checks.

Routes stay thin; this module owns the database probe logic.
"""
import time

from sqlalchemy import text

from app.extensions import db


def check_database(*, verbose=False):
    """Run a lightweight query against the configured database.

    Raises SQLAlchemy exceptions on failure; the central error handlers turn
    them into a 503/500 JSON response. Connection details and credentials are
    never returned to the client.
    """
    started = time.perf_counter()

    with db.engine.connect() as connection:
        connection.execute(text("SELECT 1"))
        server_version = _server_version(connection) if verbose else None

    latency_ms = round((time.perf_counter() - started) * 1000, 2)

    result = {
        "status": "ok",
        "database": "connected",
        "dialect": db.engine.dialect.name,
        "latency_ms": latency_ms,
    }
    if verbose:
        result["server_version"] = server_version
    return result


def _server_version(connection):
    """Return a short server version string for PostgreSQL or SQLite."""
    dialect = connection.dialect.name

    if dialect == "postgresql":
        return str(connection.execute(text("SHOW server_version")).scalar_one())
    if dialect == "sqlite":
        return str(connection.execute(text("SELECT sqlite_version()")).scalar_one())
    return "unknown"

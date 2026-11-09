"""Health endpoints: liveness and database connectivity."""
from flask import Blueprint, current_app, jsonify, request

from app.schemas.health import DatabaseHealthQuery
from app.services.health_service import check_database

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health():
    """GET /api/health — liveness check; does not touch the database."""
    return (
        jsonify(
            {
                "status": "ok",
                "service": "career-guidance-api",
                "version": current_app.config.get("APP_VERSION", "1.0.0"),
            }
        ),
        200,
    )


@health_bp.get("/health/db")
def database_health():
    """GET /api/health/db — verify the database connection.

    Optional query parameter:
      - ``verbose=true`` also returns the database server version.
    """
    query = DatabaseHealthQuery(request.args)
    result = check_database(verbose=query.verbose)
    result["service"] = "career-guidance-api"
    return jsonify(result), 200

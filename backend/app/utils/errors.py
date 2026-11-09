"""API exceptions and centralized error handlers.

Every error response uses a consistent JSON envelope:

    {"error": "Validation failed", "fields": {"email": "is required"}}

HTTP errors raised by Flask, database exceptions and unexpected exceptions are
all translated here so routes and services do not need try/except blocks.
"""
from flask import current_app, jsonify
from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError
from werkzeug.exceptions import HTTPException

from app.extensions import db


class ApiError(Exception):
    """Expected application error that maps to an HTTP status code."""

    def __init__(self, message, status_code=400, fields=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.fields = fields

    def to_dict(self):
        payload = {"error": self.message}
        if self.fields:
            payload["fields"] = self.fields
        return payload


class ValidationError(ApiError):
    """One or more request fields failed validation (HTTP 422)."""

    def __init__(self, fields, message="Validation failed"):
        super().__init__(message, status_code=422, fields=fields)


_HTTP_MESSAGES = {
    400: "Bad request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    405: "Method not allowed",
    409: "Conflict",
    413: "Request body too large",
    415: "Unsupported media type",
    500: "Internal server error",
}


def _rollback_session():
    """Best-effort rollback so a failed request does not poison the session."""
    try:
        db.session.rollback()
    except Exception:  # pragma: no cover - connection may already be broken
        current_app.logger.debug("Could not roll back database session", exc_info=True)


def register_error_handlers(app):
    """Attach JSON error handlers to the Flask application."""

    @app.errorhandler(ApiError)
    def handle_api_error(error):
        return jsonify(error.to_dict()), error.status_code

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        message = _HTTP_MESSAGES.get(error.code, error.description or "HTTP error")
        return jsonify({"error": message}), error.code

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        _rollback_session()
        current_app.logger.warning("Database integrity error: %s", error)
        return jsonify({"error": "The request conflicts with existing data"}), 409

    @app.errorhandler(OperationalError)
    def handle_operational_error(error):
        _rollback_session()
        current_app.logger.error("Database connection error: %s", error)
        return jsonify({"error": "Database is unavailable"}), 503

    @app.errorhandler(SQLAlchemyError)
    def handle_database_error(error):
        _rollback_session()
        current_app.logger.exception("Unhandled database error")
        return jsonify({"error": "A database error occurred"}), 500

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        if isinstance(error, HTTPException):
            return handle_http_error(error)

        _rollback_session()
        current_app.logger.exception("Unhandled server error")

        # Let tests surface unexpected exceptions instead of hiding them.
        if app.config.get("TESTING"):
            raise error

        return jsonify({"error": "Internal server error"}), 500

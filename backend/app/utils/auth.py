"""JWT authentication helpers: current user, role guards and callbacks."""
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models.user import User
from app.utils.errors import ApiError


def get_current_user():
    """Return the active user identified by the verified JWT."""
    identity = get_jwt_identity()
    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        raise ApiError("Invalid authentication token", status_code=401)

    user = db.session.get(User, user_id)
    if user is None or not user.is_active:
        raise ApiError(
            "Authentication token is no longer valid", status_code=401
        )
    return user


def role_required(*roles):
    """Protect a route with a valid JWT and one of the given roles."""

    def decorator(view):
        @wraps(view)
        @jwt_required()
        def wrapped(*args, **kwargs):
            user = get_current_user()
            if user.role not in roles:
                raise ApiError(
                    "You do not have permission to access this resource",
                    status_code=403,
                )
            return view(*args, **kwargs)

        return wrapped

    return decorator


def admin_required(view):
    """Shorthand for routes that only administrators may call."""
    return role_required("admin")(view)


def register_jwt_callbacks(jwt):
    """Register token revocation and consistent 401 error messages."""

    @jwt.token_in_blocklist_loader
    def is_token_revoked(_header, payload):
        try:
            user_id = int(payload.get("sub"))
        except (TypeError, ValueError):
            return True

        user = db.session.get(User, user_id)
        if user is None or not user.is_active:
            return True

        # Logout increments token_version, invalidating every older token.
        return int(payload.get("ver", -1)) != int(user.token_version or 0)

    @jwt.unauthorized_loader
    def missing_token(_reason):
        return jsonify({"error": "Authentication required"}), 401

    @jwt.invalid_token_loader
    def invalid_token(_reason):
        return jsonify({"error": "Invalid authentication token"}), 401

    @jwt.expired_token_loader
    def expired_token(_header, _payload):
        return jsonify({"error": "Authentication token has expired"}), 401

    @jwt.revoked_token_loader
    def revoked_token(_header, _payload):
        return jsonify({"error": "Authentication token has been revoked"}), 401

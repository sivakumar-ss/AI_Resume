"""Authentication routes: register, login, current user and logout."""
from flask import Blueprint, current_app, jsonify
from flask_jwt_extended import (
    jwt_required,
    set_access_cookies,
    unset_jwt_cookies,
)

from app.schemas.auth import LoginSchema, RegisterSchema
from app.schemas.serializers import serialize_profile, serialize_user
from app.services.auth_service import (
    authenticate_user,
    issue_access_token,
    register_student,
    revoke_user_tokens,
)
from app.utils.auth import get_current_user
from app.utils.validation import get_json_body

auth_bp = Blueprint("auth", __name__)


def _auth_response(user, status_code):
    """Build an auth response with both an HttpOnly cookie and a Bearer token.

    The browser client uses the cookie (JavaScript cannot read it); the token
    in the body keeps the API convenient for non-browser clients and tests.
    """
    expires = current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES")
    expires_in = (
        int(expires.total_seconds()) if hasattr(expires, "total_seconds") else None
    )
    token = issue_access_token(user)
    response = jsonify(
        {
            "access_token": token,
            "token_type": "Bearer",
            "expires_in": expires_in,
            "user": serialize_user(user),
            "profile": serialize_profile(user.profile, user),
        }
    )
    # Also sets the readable CSRF companion cookie used by the SPA.
    set_access_cookies(response, token)
    return response, status_code


@auth_bp.post("/register")
def register():
    """POST /api/auth/register — create a student account + profile."""
    data = RegisterSchema(get_json_body()).done()
    user = register_student(data)
    return _auth_response(user, 201)


@auth_bp.post("/login")
def login():
    """POST /api/auth/login — verify credentials and issue a JWT."""
    data = LoginSchema(get_json_body()).done()
    user = authenticate_user(data["email"], data["password"])
    return _auth_response(user, 200)


@auth_bp.get("/me")
@jwt_required()
def me():
    """GET /api/auth/me — restore the current session."""
    user = get_current_user()
    return (
        jsonify(
            {
                "user": serialize_user(user),
                "profile": serialize_profile(user.profile, user),
            }
        ),
        200,
    )


@auth_bp.post("/logout")
@jwt_required()
def logout():
    """POST /api/auth/logout — revoke all outstanding JWTs for this user."""
    user = get_current_user()
    revoke_user_tokens(user)
    response = jsonify({"message": "Logged out successfully"})
    unset_jwt_cookies(response)
    return response, 200

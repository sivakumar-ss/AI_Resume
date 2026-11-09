"""Authentication business logic: registration, login, tokens and logout."""
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db
from app.models.student_profile import StudentProfile
from app.models.user import User
from app.utils.errors import ApiError

# Used to keep login timing similar when the email does not exist.
_DUMMY_PASSWORD_HASH = generate_password_hash("career-guidance-dummy-password")


def normalize_email(email):
    return email.strip().lower()


def register_student(data):
    """Create a student account and its academic profile atomically."""
    email = normalize_email(data["email"])

    if db.session.scalar(db.select(User).where(User.email == email)):
        raise ApiError("An account with this email already exists", status_code=409)

    user = User(
        email=email,
        password_hash=generate_password_hash(data["password"]),
        full_name=data["full_name"],
        role="student",
        is_active=True,
    )
    # Profile creation after registration. Academic values have safe defaults
    # and can be updated through PUT /api/profile.
    profile = StudentProfile(
        user=user,
        branch=data.get("branch", "Undeclared"),
        semester=data.get("semester", 1),
        cgpa=data.get("cgpa"),
        graduation_year=data.get("graduation_year"),
        bio=data.get("bio"),
        interests=data.get("interests", []),
    )
    db.session.add(user)

    try:
        db.session.commit()
    except IntegrityError:
        # Handles the race where another request inserted the same email.
        db.session.rollback()
        raise ApiError("An account with this email already exists", status_code=409)

    return user


def authenticate_user(email, password):
    """Return the user for valid credentials, otherwise raise a 401."""
    email = normalize_email(email)
    user = db.session.scalar(db.select(User).where(User.email == email))

    if user is None:
        check_password_hash(_DUMMY_PASSWORD_HASH, password)
        raise ApiError("Invalid email or password", status_code=401)

    try:
        password_ok = check_password_hash(user.password_hash, password)
    except (TypeError, ValueError):
        password_ok = False

    if not password_ok:
        raise ApiError("Invalid email or password", status_code=401)
    if not user.is_active:
        raise ApiError("This account has been deactivated", status_code=403)

    return user


def issue_access_token(user):
    """Create a JWT containing the identity, role and token version."""
    return create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role,
            "ver": int(user.token_version or 0),
        },
    )


def revoke_user_tokens(user):
    """Invalidate every JWT issued to this user (logout on all devices)."""
    user.token_version = int(user.token_version or 0) + 1
    db.session.commit()
    return user.token_version


def create_admin(email, password, full_name):
    """Create an admin account (used by the ``flask create-admin`` command)."""
    email = normalize_email(email)

    if db.session.scalar(db.select(User).where(User.email == email)):
        raise ApiError("An account with this email already exists", status_code=409)

    user = User(
        email=email,
        password_hash=generate_password_hash(password),
        full_name=full_name,
        role="admin",
        is_active=True,
    )
    db.session.add(user)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        raise ApiError("An account with this email already exists", status_code=409)

    return user

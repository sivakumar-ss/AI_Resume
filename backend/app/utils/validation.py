"""Request parsing and lightweight validation helpers.

Usage in a future route:

    data = get_json_body()
    validator = Validator(data)
    email = validator.email("email")
    password = validator.password("password")
    payload = validator.done()   # raises ValidationError (HTTP 422)

The same Validator works for query strings (``request.args``), which is how
``GET /api/health/db?verbose=true`` is validated.
"""
import math
import re

from flask import request

from app.utils.errors import ApiError, ValidationError

_MISSING = object()
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def get_json_body():
    """Return the request's JSON object or raise a 400 ApiError."""
    if not request.is_json:
        raise ApiError("Content-Type must be application/json", status_code=400)

    data = request.get_json(silent=True)
    if data is None:
        raise ApiError("Malformed or empty JSON body", status_code=400)
    if not isinstance(data, dict):
        raise ApiError("Request body must be a JSON object", status_code=400)
    return data


class Validator:
    """Collect field errors and return clean, typed values.

    Each method records an error and returns ``None`` instead of raising, so
    all invalid fields can be reported together via ``done()``.
    """

    def __init__(self, data):
        if data is None:
            data = {}
        if not hasattr(data, "get"):
            raise ApiError("Request data must be an object", status_code=400)

        self._data = data
        self.errors = {}
        self.cleaned = {}

    def done(self):
        """Return validated data or raise a single 422 ValidationError."""
        if self.errors:
            raise ValidationError(fields=self.errors)
        return self.cleaned

    # ---- primitive helpers ------------------------------------------------

    def _read(self, field, *, required, default):
        raw = self._data.get(field, _MISSING)

        if raw is _MISSING or raw is None or (
            isinstance(raw, str) and not raw.strip()
        ):
            # An explicit default makes the field optional.
            if default is not _MISSING:
                self.cleaned[field] = default
                return _MISSING
            if required:
                self.errors[field] = "is required"
                return _MISSING
            return _MISSING

        return raw

    def _invalid(self, field, message):
        self.errors[field] = message
        self.cleaned.pop(field, None)
        return None

    # ---- field types ------------------------------------------------------

    def string(
        self,
        field,
        *,
        required=True,
        min_length=None,
        max_length=None,
        strip=True,
        default=_MISSING,
    ):
        raw = self._read(field, required=required, default=default)
        if raw is _MISSING:
            return default if default is not _MISSING else None

        if not isinstance(raw, str):
            return self._invalid(field, "must be a string")

        value = raw.strip() if strip else raw
        if min_length is not None and len(value) < min_length:
            return self._invalid(
                field, f"must be at least {min_length} characters long"
            )
        if max_length is not None and len(value) > max_length:
            return self._invalid(
                field, f"must be at most {max_length} characters long"
            )

        self.cleaned[field] = value
        return value

    def email(self, field="email", *, required=True, default=_MISSING):
        value = self.string(
            field, required=required, max_length=255, default=default
        )
        if value is None:
            return None
        if not _EMAIL_RE.match(value):
            return self._invalid(field, "must be a valid email address")

        value = value.lower()
        self.cleaned[field] = value
        return value

    def password(
        self,
        field="password",
        *,
        required=True,
        min_length=8,
        max_length=128,
    ):
        return self.string(
            field,
            required=required,
            min_length=min_length,
            max_length=max_length,
            strip=False,
        )

    def integer(
        self,
        field,
        *,
        required=True,
        min_value=None,
        max_value=None,
        default=_MISSING,
    ):
        raw = self._read(field, required=required, default=default)
        if raw is _MISSING:
            return default if default is not _MISSING else None

        if isinstance(raw, bool) or not isinstance(raw, (int, str)):
            return self._invalid(field, "must be an integer")

        try:
            value = int(raw)
        except (TypeError, ValueError):
            return self._invalid(field, "must be an integer")

        if min_value is not None and value < min_value:
            return self._invalid(field, f"must be at least {min_value}")
        if max_value is not None and value > max_value:
            return self._invalid(field, f"must be at most {max_value}")

        self.cleaned[field] = value
        return value

    def number(
        self,
        field,
        *,
        required=True,
        min_value=None,
        max_value=None,
        default=_MISSING,
    ):
        """Validate a decimal number (e.g. CGPA)."""
        raw = self._read(field, required=required, default=default)
        if raw is _MISSING:
            return default if default is not _MISSING else None

        if isinstance(raw, bool) or not isinstance(raw, (int, float, str)):
            return self._invalid(field, "must be a number")

        try:
            value = float(raw)
        except (TypeError, ValueError):
            return self._invalid(field, "must be a number")

        if not math.isfinite(value):
            return self._invalid(field, "must be a finite number")
        if min_value is not None and value < min_value:
            return self._invalid(field, f"must be at least {min_value}")
        if max_value is not None and value > max_value:
            return self._invalid(field, f"must be at most {max_value}")

        self.cleaned[field] = value
        return value

    def boolean(self, field, *, required=True, default=_MISSING):
        raw = self._read(field, required=required, default=default)
        if raw is _MISSING:
            return default if default is not _MISSING else None

        if isinstance(raw, bool):
            value = raw
        elif isinstance(raw, int) and raw in (0, 1):
            value = bool(raw)
        elif isinstance(raw, str):
            lowered = raw.strip().lower()
            if lowered in {"true", "1", "yes", "on"}:
                value = True
            elif lowered in {"false", "0", "no", "off"}:
                value = False
            else:
                return self._invalid(field, "must be a boolean")
        else:
            return self._invalid(field, "must be a boolean")

        self.cleaned[field] = value
        return value

    def enum(self, field, allowed, *, required=True, default=_MISSING):
        allowed = tuple(allowed)
        value = self.string(field, required=required, default=default)
        if value is None:
            return None
        if value not in allowed:
            return self._invalid(
                field, f"must be one of: {', '.join(map(str, allowed))}"
            )
        return value

    def string_list(
        self,
        field,
        *,
        required=True,
        max_items=50,
        item_max_length=100,
        default=_MISSING,
    ):
        """Validate a list of non-empty strings (e.g. interests)."""
        raw = self._read(field, required=required, default=default)
        if raw is _MISSING:
            return default if default is not _MISSING else None

        if not isinstance(raw, list):
            return self._invalid(field, "must be a list of strings")
        if len(raw) > max_items:
            return self._invalid(field, f"must contain at most {max_items} items")

        cleaned_items = []
        for index, item in enumerate(raw, start=1):
            if not isinstance(item, str):
                return self._invalid(field, f"item {index} must be a string")
            value = item.strip()
            if not value:
                return self._invalid(field, f"item {index} must not be empty")
            if len(value) > item_max_length:
                return self._invalid(
                    field,
                    f"item {index} must be at most {item_max_length} characters long",
                )
            cleaned_items.append(value)

        self.cleaned[field] = cleaned_items
        return cleaned_items


class Schema:
    """Base class for request schemas.

    Subclasses implement ``load()`` and call validator methods; ``done()``
    raises a single 422 ValidationError containing every field error.
    """

    def __init__(self, data):
        self.validator = Validator(data)
        self.load()

    def load(self):
        raise NotImplementedError

    def done(self):
        return self.validator.done()

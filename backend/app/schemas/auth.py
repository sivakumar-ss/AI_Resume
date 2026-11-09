"""Authentication request schemas and response serializers."""
from app.utils.validation import Schema


class RegisterSchema(Schema):
    """Student registration.

    Academic fields are optional so a profile can always be created; missing
    values use sensible defaults that the student can update later.
    """

    def load(self):
        v = self.validator
        v.email("email")
        v.password("password")
        v.string("full_name", min_length=2, max_length=120)
        v.string(
            "branch",
            required=False,
            max_length=100,
            default="Undeclared",
        )
        v.integer("semester", required=False, min_value=1, max_value=8, default=1)
        v.number("cgpa", required=False, min_value=0, max_value=10)
        v.integer(
            "graduation_year", required=False, min_value=2000, max_value=2100
        )
        v.string("bio", required=False, max_length=1000)
        v.string_list(
            "interests",
            required=False,
            max_items=20,
            item_max_length=50,
            default=[],
        )


class LoginSchema(Schema):
    def load(self):
        self.validator.email("email")
        # Do not enforce the registration minimum here: existing accounts must
        # still be able to log in even if password policy changes later.
        self.validator.string(
            "password", required=True, max_length=128, strip=False
        )

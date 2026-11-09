"""Schemas for health-check endpoints."""
from app.utils.validation import Validator


class DatabaseHealthQuery:
    """Validated query parameters for ``GET /api/health/db``.

    ``verbose=true`` adds the database server version to the response.
    """

    def __init__(self, args):
        validator = Validator(args)
        self.verbose = validator.boolean("verbose", default=False)
        validator.done()

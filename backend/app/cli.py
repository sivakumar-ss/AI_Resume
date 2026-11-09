"""Command-line helpers.

Create the first administrator with:

    flask --app run.py create-admin
"""
import click

from app.services.auth_service import create_admin
from app.utils.errors import ApiError
from app.utils.validation import Validator


def register_cli(app):
    """Register custom Flask CLI commands."""

    @app.cli.command("create-admin")
    @click.option("--email", prompt=True)
    @click.option("--full-name", prompt="Full name")
    @click.option(
        "--password",
        prompt=True,
        hide_input=True,
        confirmation_prompt=True,
    )
    def create_admin_command(email, full_name, password):
        """Create an administrator account (no public admin signup)."""
        validator = Validator(
            {"email": email, "full_name": full_name, "password": password}
        )
        validator.email("email")
        validator.string("full_name", min_length=2, max_length=120)
        validator.password("password")

        try:
            payload = validator.done()
            user = create_admin(**payload)
        except ApiError as error:
            raise click.ClickException(error.message) from error

        click.echo(f"Admin account created: {user.email}")

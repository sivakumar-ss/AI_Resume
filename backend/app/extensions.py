"""
Shared Flask extension instances.

Instantiated here (not inside create_app) to avoid circular imports —
models and routes import `db` from this module.
"""
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
jwt = JWTManager()

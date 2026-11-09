"""Route blueprints. Each feature gets its own module."""
from app.routes.admin import admin_bp
from app.routes.assessments import assessments_bp
from app.routes.auth import auth_bp
from app.routes.health import health_bp
from app.routes.profile import profile_bp
from app.routes.recommendations import recommendations_bp
from app.routes.resume import resume_bp
from app.routes.roadmap import roadmap_bp
from app.routes.skill_gap import skill_gap_bp


def register_blueprints(app):
    """Register all API blueprints under /api."""
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(assessments_bp, url_prefix="/api/assessments")
    app.register_blueprint(resume_bp, url_prefix="/api/resume")
    app.register_blueprint(recommendations_bp, url_prefix="/api/recommendations")
    app.register_blueprint(roadmap_bp, url_prefix="/api/roadmap")
    app.register_blueprint(skill_gap_bp, url_prefix="/api/skill-gap")

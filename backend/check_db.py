"""
Database connectivity and schema check.

Usage (from the backend/ folder, with the venv active):

    python check_db.py                  # verify connection + expected tables
    python check_db.py --create-tables  # create any missing tables from the models

Connection strings are read from backend/.env:
  * SUPABASE_DB_URL     - runtime connection (transaction pooler, port 6543)
  * SUPABASE_DIRECT_URL - session pooler (port 5432), used for schema creation

Table creation always goes through the session-mode pooler (or SQLite when no
Supabase project is configured). Verification always uses the runtime
connection, so both paths are proven. The password is never printed.
"""
import argparse
import sys

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import make_url

from app import create_app
from app.extensions import db


def _safe_target(uri):
    """Describe the target without exposing credentials."""
    url = make_url(uri)
    if url.host:
        return f"{url.drivername} @ {url.host}:{url.port or 'default'} / {url.database}"
    return f"{url.drivername} (local file: {url.database})"


def _build_engine(uri):
    """Create a standalone engine for one-off schema work (not the app engine)."""
    options = {"pool_pre_ping": True, "pool_recycle": 300}
    if ":6543/" in uri:
        # Transaction pooler: client-side prepared statements must be disabled.
        options["connect_args"] = {"prepare_threshold": None}
    return create_engine(uri, **options)


def _server_version(engine):
    """Return the server version string for PostgreSQL or SQLite."""
    dialect = engine.dialect.name
    sql = "SELECT version()" if dialect == "postgresql" else "SELECT sqlite_version()"
    with engine.connect() as connection:
        return connection.execute(text(sql)).scalar_one()


def main():
    parser = argparse.ArgumentParser(
        description="Check the SQLAlchemy database connection and schema."
    )
    parser.add_argument(
        "--create-tables",
        action="store_true",
        help="Create missing tables from the SQLAlchemy models (idempotent).",
    )
    args = parser.parse_args()

    app = create_app()

    with app.app_context():
        runtime_uri = app.config["SQLALCHEMY_DATABASE_URI"]
        direct_uri = app.config.get("SQLALCHEMY_DIRECT_URI") or runtime_uri

        # The session pooler only exists for PostgreSQL. With the SQLite
        # fallback, schema creation must target the same local file.
        if runtime_uri.startswith("sqlite"):
            direct_uri = runtime_uri

        print(f"Runtime target: {_safe_target(runtime_uri)}")

        try:
            version = _server_version(db.engine)
        except Exception as exc:  # noqa: BLE001 - surface any driver/network error
            print(f"[FAIL] Could not connect: {exc}")
            return 1

        print(f"[OK] Connected ({db.engine.dialect.name}) - {str(version)[:100]}")

        if args.create_tables:
            if direct_uri == runtime_uri:
                schema_engine = db.engine
                print("Schema target: same as runtime")
            else:
                print(f"Schema target: {_safe_target(direct_uri)}")
                schema_engine = _build_engine(direct_uri)
                try:
                    _server_version(schema_engine)
                except Exception as exc:  # noqa: BLE001
                    print(f"[FAIL] Could not connect to schema target: {exc}")
                    schema_engine.dispose()
                    return 1

            try:
                db.metadata.create_all(schema_engine)
            except Exception as exc:  # noqa: BLE001
                print(f"[FAIL] Could not create tables: {exc}")
                return 1
            finally:
                if schema_engine is not db.engine:
                    schema_engine.dispose()

            print(
                "[OK] Missing tables created via db.create_all() "
                "(existing tables untouched)."
            )

        inspector = inspect(db.engine)
        existing = set(inspector.get_table_names())
        expected = sorted(db.metadata.tables.keys())
        missing = [table for table in expected if table not in existing]

        print(f"Tables: {len(expected) - len(missing)}/{len(expected)} present")
        for table in expected:
            state = "OK" if table in existing else "MISSING"
            print(f"  [{state:^7}] {table}")

        if missing:
            print(
                "\nSome tables are missing. Run with --create-tables "
                "(or apply database/schema.sql) and check again."
            )
            return 1

        print("\nDatabase connection and schema look good.")
        return 0


if __name__ == "__main__":
    sys.exit(main())

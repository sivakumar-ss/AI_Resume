# Database (Supabase PostgreSQL)

The backend uses **SQLAlchemy + psycopg 3** against **Supabase PostgreSQL**.
The frontend never connects to the database — it only calls the Flask API.

## Schema overview (11 tables)

| Table | Purpose | Key relationships |
| --- | --- | --- |
| `users` | Accounts (student/admin) | 1:1 profile; 1:N resumes, assessments, recommendations |
| `student_profiles` | Academic, education and interest data | 1:1 user; 1:N student_skills, learning_progress |
| `skills` | Canonical skills catalogue | 1:N student_skills, career_skills, learning_resources |
| `student_skills` | Student ↔ skill with proficiency (1–5) | UNIQUE(profile, skill) |
| `careers` | Career catalogue scored by ML | 1:N career_skills, recommendations |
| `career_skills` | Career ↔ skill with importance (1–5) | UNIQUE(career, skill) |
| `resumes` | Analysis results only (no raw file/text) | N:1 user |
| `assessments` | Interest/aptitude/skills attempts | N:1 user |
| `recommendations` | Generated top-N results per batch | UNIQUE(user, career, batch) |
| `learning_resources` | Courses/videos/etc. per skill | nullable N:1 skill |
| `learning_progress` | Per-student resource progress | UNIQUE(profile, resource) |

All tables have `created_at` / `updated_at` (`timestamptz`). Integer identity
primary keys; foreign keys use `ON DELETE CASCADE` (skills on resources use
`SET NULL`). The authoritative model definitions are in `backend/app/models/`.

`users.token_version` (integer, default `0`) supports server-side logout: every
JWT embeds the version it was issued with, and logout increments the column, so
all older tokens for that account are rejected. This avoids a twelfth
token-blocklist table.

`student_profiles.branch` stores the student's **department** (the API returns it
as both `department` and `branch`). Profile management adds three columns:

| Column | Type | Default | Allowed values |
| --- | --- | --- | --- |
| `education_level` | `varchar(30)` NOT NULL | `undergraduate` | `high_school`, `higher_secondary`, `diploma`, `undergraduate`, `postgraduate`, `doctorate` |
| `college_name` | `varchar(200)` NULL | `null` | free text |
| `experience_level` | `varchar(30)` NOT NULL | `beginner` | `beginner`, `intermediate`, `advanced` |

Career interests remain in the free-form `interests` JSONB array (`[]` by
default). Technical skills are normalized: `skills` holds canonical lowercase
names and `student_skills` links a profile to a skill with
`proficiency_level` 1–5. Names are normalized to trimmed, single-spaced
lowercase, and the same catalogue skill can be linked to many students.

## Setting up Supabase

1. Create a free account at [supabase.com](https://supabase.com) and create a project.
2. Open **Project Settings → Database → Connection info** and copy the
   **Shared Pooler** connection strings (IPv4-friendly):
   - **Transaction mode, port 6543** — runtime queries.
   - **Session mode, port 5432** — schema creation / migrations.
3. Put both in `backend/.env` (create the file from `backend/.env.example`):

   ```env
   SUPABASE_DB_URL=postgresql+psycopg://postgres.<PROJECT-REF>:<PASSWORD>@aws-1-<REGION>.pooler.supabase.com:6543/postgres?sslmode=require
   SUPABASE_DIRECT_URL=postgresql+psycopg://postgres.<PROJECT-REF>:<PASSWORD>@aws-1-<REGION>.pooler.supabase.com:5432/postgres?sslmode=require
   ```

   URL-encode special characters in the password (e.g. `@` → `%40`). Keep the
   `postgresql+psycopg://` prefix (we use psycopg 3). Do **not** add Prisma's
   `?pgbouncer=true` — psycopg rejects it; prepared statements are disabled
   automatically for port 6543 in `app/config.py`.
4. Allow your IP: **Project Settings → Network Restrictions** (or allow all during development).

> The password lives **only** in `backend/.env`, which is git-ignored. Never put
> it in frontend code, `VITE_` variables, or a committed file.

## Creating the tables

Pick **one** approach and stay consistent:

| Approach | How | When to use |
| --- | --- | --- |
| **A. SQLAlchemy (recommended)** | `cd backend && python check_db.py --create-tables` | Python-first development; creates only missing tables |
| **B. SQL Editor** | Run [`schema.sql`](schema.sql) in the Supabase SQL Editor | You prefer managing schema in Supabase |

Both are idempotent (`CREATE TABLE IF NOT EXISTS` / `create_all()` never
recreates existing tables). Option A connects through `SUPABASE_DIRECT_URL`
(session pooler, port 5432) to run DDL, then verifies through `SUPABASE_DB_URL`
(transaction pooler, port 6543).

## Applying migrations

Databases created before an auth change must apply the SQL files in
[`migrations/`](migrations/) once:

| Migration | Purpose |
| --- | --- |
| [`001_add_token_version.sql`](migrations/001_add_token_version.sql) | Adds `users.token_version` for JWT logout invalidation |
| [`002_add_profile_fields.sql`](migrations/002_add_profile_fields.sql) | Adds `education_level`, `college_name`, `experience_level` to `student_profiles` |

Run them in the **Supabase SQL Editor**, or from `psql` using the session-pooler
URI from `backend/.env`:

```powershell
psql "<SUPABASE_DIRECT_URL>" -f database/migrations/001_add_token_version.sql
psql "<SUPABASE_DIRECT_URL>" -f database/migrations/002_add_profile_fields.sql
```

The migrations use `ADD COLUMN IF NOT EXISTS` and guarded constraint creation,
so they are safe to run more than once. Avoid pasting the connection URI into
shared shell history.

## Connection test

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python check_db.py
```

Expected output:

```
Runtime target: postgresql+psycopg @ aws-1-<region>.pooler.supabase.com:6543 / postgres
[OK] Connected (postgresql) - PostgreSQL 17.x ...
Tables: 11/11 present
  [  OK   ] assessments
  ...
Database connection and schema look good.
```

`--create-tables` creates any missing tables (via the session pooler) before
checking. The script reads `backend/.env` and never prints the password.

## If an older schema was already applied

This project earlier had a 5-table reference schema (`profiles`,
`resume_analyses`, JSON skills). `CREATE TABLE IF NOT EXISTS` will **not** alter
those tables. On a **development** database, run the reset block at the bottom
of `schema.sql` (uncomment it) and apply the schema again. Do not run it on a
database with data you want to keep.

## Local development without Supabase

If `SUPABASE_DB_URL` is unset, the backend falls back to
`backend/instance/career_guidance.db` (SQLite). The full schema works there
(JSON instead of JSONB), which is handy before Supabase is configured — but
SQLite is not production-equivalent. Switch to Supabase before the demo.

# AI-Powered Career Guidance: A Scalable Model for Personalized Recommendations

BTech major project — an AI system that profiles a student's skills, interests and
academic background, then returns **personalized career recommendations** using
machine learning (scikit-learn) and NLP (spaCy).

## Tech Stack

| Layer        | Technology                                  |
| ------------ | ------------------------------------------- |
| Frontend     | React 19 + Vite, Tailwind CSS               |
| Backend      | Python Flask (REST API)                     |
| Database     | Supabase PostgreSQL                         |
| ORM          | SQLAlchemy (Flask-SQLAlchemy)               |
| Auth         | Flask-JWT-Extended (JWT)                    |
| ML           | scikit-learn                                |
| NLP          | spaCy                                       |

## Project Structure

```
career-guidance/
├── frontend/               # React + Vite + Tailwind app (port 5173)
│   ├── src/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── backend/                # Flask REST API (port 5000)
│   ├── app/
│   │   ├── __init__.py     # Application factory + extension wiring
│   │   ├── config.py       # Env-based configuration (dev/test/prod)
│   │   ├── cli.py          # create-admin command
│   │   ├── extensions.py   # db (SQLAlchemy), jwt instances
│   │   ├── models/         # 11 SQLAlchemy models (users, profiles, skills, ...)
│   │   ├── routes/         # API blueprints (health, auth, profile, admin, ...)
│   │   ├── schemas/        # Request validation schemas + serializers
│   │   ├── services/       # Business logic (auth, profile, ml/, nlp/)
│   │   └── utils/          # JWT guards, centralized errors, validation helpers
│   ├── tests/              # unittest suite (health, auth, validation, errors)
│   ├── check_db.py         # Database connection + schema check
│   ├── requirements.txt
│   └── run.py              # Dev entry point
├── database/               # schema.sql (11 tables) + migrations + Supabase guide
├── docs/                   # Architecture & project plan
├── .env.example            # Master env template (backend + frontend)
└── .gitignore
```

## Prerequisites

- **Node.js 20+** (tested on v24) and npm
- **Python 3.10+** (tested on 3.14)
- A **Supabase** account (optional for the first run — a local SQLite fallback is configured)

---

## 1. Database setup (Supabase)

See [`database/README.md`](database/README.md) for full instructions.

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the **Shared Pooler** connection strings from **Project Settings → Database → Connection info**.
3. Paste both into `backend/.env`:
   - `SUPABASE_DB_URL` — transaction pooler, port 6543 (runtime)
   - `SUPABASE_DIRECT_URL` — session pooler, port 5432 (schema/migrations)

   Keep the `postgresql+psycopg://` prefix; URL-encode special characters in the
   password (e.g. `@` → `%40`). Do not add `?pgbouncer=true`.
4. Create the 11 tables using **one** of these:
   - **SQLAlchemy (recommended):** `cd backend; python check_db.py --create-tables`
   - **SQL Editor:** run [`database/schema.sql`](database/schema.sql)
5. Verify the connection and tables: `cd backend; python check_db.py`

> Credentials live **only** in `backend/.env`. The React app must never receive
> database credentials — it talks to Flask over HTTP.
>
> No Supabase yet? Skip it — the backend automatically falls back to a local
> SQLite file (`backend/instance/career_guidance.db`).

## 2. Backend setup (Flask)

```powershell
cd career-guidance/backend

# Create and activate a virtual environment (Windows PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create your environment file and edit the values
Copy-Item .env.example .env

# Run the API (http://127.0.0.1:5000)
python run.py
```

macOS/Linux activation: `source venv/bin/activate`

## 3. Frontend setup (React + Vite)

Open a **second terminal**:

```powershell
cd career-guidance/frontend

npm install

# Optional: create your environment file
Copy-Item .env.example .env

# Run the dev server (http://localhost:5173)
npm run dev
```

## 4. Verify the stack

With the backend running:

```
GET http://127.0.0.1:5000/api/health
→ {"status":"ok","service":"career-guidance-api","version":"1.0.0"}

GET http://127.0.0.1:5000/api/health/db?verbose=true
→ {"status":"ok","database":"connected","dialect":"postgresql",
   "latency_ms":42.1,"server_version":"17.11","service":"career-guidance-api"}
```

The Vite dev server proxies `/api/*` to the Flask backend (see `vite.config.js`),
so from the browser you can call `/api/health` on port 5173 too.

Run the backend test suite (no database or network required):

```powershell
cd backend
.\venv\Scripts\python.exe -m unittest discover -s tests -v
```

## Authentication and Profile API

All endpoints are under `/api`; protected routes require
`Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create a student account + profile; returns a JWT |
| POST | `/api/auth/login` | Public | Verify credentials; returns a JWT |
| GET | `/api/auth/me` | JWT | Current user + profile |
| POST | `/api/auth/logout` | JWT | Revoke all outstanding tokens for the account |
| GET | `/api/profile` | JWT + student | Read the authenticated user's profile |
| PUT / PATCH | `/api/profile` | JWT + student | Update the authenticated user's profile |
| GET | `/api/profile/skills` | JWT + student | List the student's technical skills |
| POST | `/api/profile/skills` | JWT + student | Add a technical skill by name |
| PUT / PATCH | `/api/profile/skills/{id}` | JWT + student | Update a skill's proficiency (1–5) |
| DELETE | `/api/profile/skills/{id}` | JWT + student | Remove a skill from the profile |
| GET | `/api/admin/stats` | JWT + admin | Aggregate user/profile/career counts |

Passwords are hashed with Werkzeug (scrypt); the database stores only the hash.
JWTs carry `sub`, `role` and `ver`. Logout increments `users.token_version`, so
every older token for that account is rejected. Registration always creates a
`student` (client-supplied roles are ignored) and a default profile
(`branch="Undeclared"`, `education_level="undergraduate"`,
`experience_level="beginner"`, `semester=1`) in one transaction. Profile
endpoints never accept a `user_id` — ownership comes from the JWT, and a
student's skill links are scoped to their own profile (cross-user access returns
`404`). There is no profile DELETE: the profile is account-bound and cascades
when the user is removed.

**Profile fields:** `full_name`, `education_level`, `department` (alias
`branch`), `college_name`, `graduation_year`, `experience_level`,
`technical_skills`, `career_interests` (alias `interests`), plus `semester`,
`cgpa` and `bio`. `education_level` is one of `high_school`,
`higher_secondary`, `diploma`, `undergraduate`, `postgraduate`, `doctorate`;
`experience_level` is `beginner`, `intermediate` or `advanced`. Sending
`technical_skills: ["Python", "SQL"]` in a profile update replaces the skill set
(proficiency is preserved for retained skills, new skills default to `3`).

Quick authentication check (PowerShell, with the backend running):

```powershell
$body = @{ email = "student@college.edu"; password = "secret123"; full_name = "Asha Rao" } | ConvertTo-Json
$auth = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/api/auth/register -ContentType application/json -Body $body
$headers = @{ Authorization = "Bearer $($auth.access_token)" }
Invoke-RestMethod -Uri http://127.0.0.1:5000/api/auth/me -Headers $headers
```

Example profile update (using `$headers` from above):

```powershell
$profile = @{
  full_name        = "Asha Rao"
  education_level  = "undergraduate"
  department       = "Computer Science"
  college_name     = "National Institute of Technology"
  graduation_year  = 2028
  experience_level = "intermediate"
  technical_skills = @("Python", "SQL")
  career_interests = @("machine learning", "research")
} | ConvertTo-Json
Invoke-RestMethod -Method Patch -Uri http://127.0.0.1:5000/api/profile `
  -Headers $headers -ContentType application/json -Body $profile

Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/api/profile/skills `
  -Headers $headers -ContentType application/json `
  -Body (@{ name = "Python"; proficiency_level = 4 } | ConvertTo-Json)
```

Logging out revokes all outstanding tokens:

```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:5000/api/auth/logout -Headers $headers
```

Create an administrator (there is no public admin signup):

```powershell
cd backend
flask --app run.py create-admin
```

---

## Frontend (CareerCompass)

The React app in [`frontend/`](frontend/README.md) is fully routed with
`react-router-dom`, Axios and Tailwind CSS. It is branded **CareerCompass** and
uses a navy, white and light-blue SaaS design with Inter typography and
`lucide-react` icons.

**Live, API-backed pages**

| Route | Page | Backend |
| --- | --- | --- |
| `/` | Landing page | Static content |
| `/register`, `/login` | Student registration and sign in | `/api/auth/*` |
| `/dashboard` | Student dashboard | Session profile from `/api/auth/me` |
| `/profile` | Academic profile, interests and skills | `/api/profile` + `/api/profile/skills` CRUD |
| `/admin` | Admin overview | `/api/admin/stats` + health checks |

**Preview pages awaiting their backend modules**

`/resume-analyzer`, `/skill-assessment`, `/recommendations`, `/skill-gap` and
`/roadmap` are complete, responsive interfaces that display real profile data but
are explicitly marked **In development**. They do not invent matches, scores,
assessments or learning plans.

Authentication is real: browser sessions use an HttpOnly JWT cookie plus a
readable CSRF companion cookie, sessions are restored through
`GET /api/auth/me`, `401` responses expire the session, and role-aware guards
keep students and administrators in their own workspaces. API clients can still
authenticate with `Authorization: Bearer <token>`.
Administrator accounts are created only with
`flask --app run.py create-admin`; there is no public admin signup.

```powershell
cd frontend
npm run dev      # http://localhost:5173, proxies /api to Flask :5000
npm run lint
npm run build
```

The latest verification run covered registration, login/logout, session restore,
profile save, skill create/update/delete, admin statistics and health, protected
routes, the 404 page and desktop/tablet/mobile layouts. Lint passes with advisory
warnings only, the production build succeeds, and the browser run reported no
console errors, page errors or horizontal overflow.

---

## Environment Variables

| File                     | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `.env.example` (root)    | Master template — both services                    |
| `backend/.env.example`   | Copy to `backend/.env` (Flask, JWT, Supabase URL)  |
| `frontend/.env.example`  | Copy to `frontend/.env` (`VITE_API_BASE_URL`)      |

All real `.env` files are **git-ignored**. Never commit secrets. Database
credentials belong only in `backend/.env` and are never exposed to Vite/React.

## Common Commands

| Task                  | Command (from `career-guidance/`)            |
| --------------------- | -------------------------------------------- |
| Run backend           | `cd backend; python run.py`                  |
| Run frontend          | `cd frontend; npm run dev`                   |
| Build frontend        | `cd frontend; npm run build`                 |
| Lint frontend         | `cd frontend; npm run lint`                  |
| Check DB connection   | `cd backend; python check_db.py`             |
| Create missing tables | `cd backend; python check_db.py --create-tables` |
| Create admin account  | `cd backend; flask --app run.py create-admin` |
| Seed careers          | `cd backend; python seed_careers.py`          |
| Add a spaCy model     | `python -m spacy download en_core_web_sm`    |

## Roadmap

Planned milestones live in [`docs/project-plan.md`](docs/project-plan.md).
Completed: scaffold, JWT authentication, student profiles/skills, the responsive
CareerCompass frontend, and the live admin overview. Next: the ML recommender
(M3), spaCy skill extraction (M4), ML-driven dashboard modules, then testing and
deployment. System design details are in
[`docs/architecture.md`](docs/architecture.md).

## Troubleshooting

- **`pip install spacy` fails on a very new Python** — spaCy wheels sometimes lag
  behind the newest Python releases. Use Python 3.11/3.12 in the venv, or
  `py -3.12 -m venv venv`.
- **PowerShell blocks activation** — run
  `Set-ExecutionPolicy -Scope Process RemoteSigned` once, or use
  `venv\Scripts\python.exe -m pip install -r requirements.txt` and
  `venv\Scripts\python.exe run.py` without activating.
- **CORS errors in the browser** — make sure the backend is running on port 5000
  and `CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173` is set in
  `backend/.env`. Use the Vite proxy (`VITE_API_BASE_URL=/api`) for local
  development so cookies stay same-origin.
- **Port already in use** — Flask: change the port in `run.py`; Vite:
  `npm run dev -- --port 5174`.

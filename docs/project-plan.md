# Project Plan (BTech Milestones)

Suggested build order — each milestone is independently demoable.

## M0 — Scaffold & tooling ✅
- Monorepo structure (`frontend/`, `backend/`, `database/`, `docs/`)
- React + Vite + Tailwind app boots; Flask app factory boots
- `/api/health` smoke-test endpoint
- Environment templates, `.gitignore`, README

## M1 — Authentication & user management ✅
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Password hashing (Werkzeug/`scrypt`), JWT access tokens
- React: login/register pages, protected routes, auth context, session restore
- **Deliverable:** only logged-in students can access the dashboard

## M2 — Student profiles & skills ✅
- Profile model: full name, education level, department, college, graduation year,
  experience level, technical skills, career interests
- REST endpoints for profile view/update and nested skill CRUD
- React: complete profile workspace, interest tags and granular skill CRUD
- **Deliverable:** a complete student profile stored in Supabase

## M3 — ML recommendation engine (core)
- Dataset of careers × required skills (+ student profiles)
- Feature engineering, content-based similarity model (TF-IDF / cosine, classifiers)
- Model evaluation (precision@k, recall@k, MAP) + versioning
- `POST /api/recommendations` returning ranked careers with explanations
- **Deliverable:** personalized career list with match scores

## M4 — NLP skill extraction
- spaCy pipeline for skill/entity extraction from free text (resume, bio)
- Map extracted entities onto the skills catalogue
- React: paste-a-resume input that auto-fills the profile
- **Deliverable:** free text → structured skills → better recommendations

## M5 — Dashboards & explainability (UI ✅, ML integration pending)
- Student dashboard: profile overview, profile strength and next actions ✅
- Admin/evaluator view: live account totals, distribution and platform health ✅
- Preview pages for recommendations, skill gaps, roadmap, resume and assessment ✅
- Pending: top careers, ML-driven skill gaps, generated roadmaps and model metrics
- **Deliverable:** "why this career?" explanations (top contributing features)

## M6 — Testing, deployment & report
- Pytest backend tests + React component tests
- Deploy: Flask on Render/Railway + React on Vercel/Netlify + Supabase
- Project report, demo video, presentation slides
- **Deliverable:** live demo link + final report

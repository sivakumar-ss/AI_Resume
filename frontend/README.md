# CareerCompass — Frontend (React + Vite + Tailwind CSS)

Client app for the AI-Powered Career Guidance project. The UI is a responsive
SaaS-style workspace built around a navy, white and light-blue design system.

## Running the app

```powershell
npm install

# Optional: copy the environment template
Copy-Item .env.example .env

npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # preview the production build
npm run lint     # oxlint
```

Start the Flask API on port 5000 first. The Vite dev server proxies `/api/*` to
`http://127.0.0.1:5000`, so the browser can use relative API URLs. Set
`VITE_API_BASE_URL` only when the API lives elsewhere (for example
`http://localhost:5000/api`).

Only `VITE_`-prefixed variables are exposed to the browser. Database and JWT
credentials belong in `backend/.env` and must never appear in frontend code.

## Implemented pages

| Route | Page | Data source |
| --- | --- | --- |
| `/` | Landing page | Static product content |
| `/register` | Student registration | `POST /api/auth/register` |
| `/login` | Sign in | `POST /api/auth/login` |
| `/dashboard` | Student dashboard | Session profile from `/api/auth/me` |
| `/profile` | Student profile + skills | `PATCH /api/profile`, `/api/profile/skills` CRUD |
| `/admin` | Admin dashboard | `GET /api/admin/stats`, `/api/health`, `/api/health/db` |
| `/resume-analyzer` | Resume analyzer preview | Real profile data; analysis marked **In development** |
| `/skill-assessment` | Skill assessment preview | Real profile data; scoring marked **In development** |
| `/recommendations` | Career recommendations preview | Real profile data; matches marked **In development** |
| `/skill-gap` | Skill gap preview | Real saved skills; gap scoring marked **In development** |
| `/roadmap` | Learning roadmap preview | Real profile data; generation marked **In development** |
| any unknown route | 404 page | — |

The ML, NLP, recommendation, gap-analysis and roadmap endpoints do not exist yet.
Those pages intentionally show their real profile inputs and an honest
“In development” state. They never invent matches, scores, assessments or plans.

## Frontend features

- Real JWT authentication with an HttpOnly cookie session, CSRF protection for
  state-changing requests and session restoration through `GET /api/auth/me`.
- Axios request/response interceptors; a `401` clears the expired session and
  returns the user to the sign-in flow with a friendly message.
- Role-aware route guards: students and administrators are redirected to their
  own workspace, and anonymous visitors are sent to `/login`.
- Fully responsive shell with a collapsible mobile sidebar, sticky top bar,
  accessible navigation and desktop sidebar.
- Profile workspace with academic fields, interest tags, inline skill
  proficiency updates, confirm-before-delete and API field errors.
- Admin dashboard with live platform totals, account distribution and
  API/database health checks.
- Loading skeletons, spinners, empty states, toasts and friendly error messages.
- Accessible forms and controls: labelled inputs, `aria-invalid`, keyboard
  handling for tag entry, focus styles and dismissible alerts.
- `lucide-react` icons, Inter typography and custom navy/brand color tokens
  defined with Tailwind v4 `@theme`.

## API endpoints used

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout
GET    /api/profile
PATCH  /api/profile
GET    /api/profile/skills
POST   /api/profile/skills
PATCH  /api/profile/skills/{id}
DELETE /api/profile/skills/{id}
GET    /api/admin/stats
GET    /api/health
GET    /api/health/db?verbose=true
```

## Project structure

```text
src/
├── api/            Axios client and endpoint wrappers
├── components/
│   ├── dashboard/  Profile summaries, completion card, status cards
│   ├── layout/     Navbar, Footer, Sidebar, AuthLayout, DashboardLayout, guards
│   └── ui/         Button, Card, Fields, Badge, Alerts, dialogs, skeletons
├── context/        AuthContext and ToastContext
├── pages/          One component per route
├── utils/          Error parsing, profile helpers, class-name helper
├── App.jsx         Route tree and scroll handling
├── index.css       Tailwind import, theme tokens and global styles
└── main.jsx        BrowserRouter + providers
```

## Verification

The frontend was verified against the real Flask backend and Supabase database:

- `npm run lint` — passes with advisory warnings only.
- `npm run build` — production build succeeds.
- Headless Chrome end-to-end run covered registration, login/logout, session
  restore, profile save, skill create/update/delete, protected-route redirects,
  admin statistics and health, 404 handling, and desktop/tablet/mobile layouts
  with no console errors, page errors or horizontal overflow.

## Upcoming backend work

The following pages are ready for integration once their endpoints exist:

1. Resume upload and spaCy skill extraction.
2. Skill assessment questions, scoring and persistence.
3. Ranked career recommendations with explanations.
4. Skill gap analysis against a target career.
5. Learning roadmap generation and progress tracking.

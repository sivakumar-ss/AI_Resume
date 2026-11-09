# Deploying to Render

One Docker web service runs everything: the Flask API under gunicorn **and**
the built React frontend from the same origin. Same origin means the JWT
cookie, the CSRF cookie and `/api` behave exactly as they do behind the local
Vite proxy — no CORS configuration is needed in production.

```
browser ──> https://<name>.onrender.com
            ├── /          -> built React app (index.html + assets)
            └── /api/*     -> Flask (gunicorn, one preloaded worker)
                     │
                     └──> Supabase PostgreSQL (session pooler, IPv4 + SSL)
```

## 1. Push the deployment files

The repository already contains `render.yaml`, `Dockerfile` and
`.dockerignore`. Commit and push them to `main`:

```bash
git add .
git commit -m "Render deployment configuration"
git push
```

## 2. Create the Render service

1. Render dashboard → **New +** → **Blueprint** → connect the
   `sivakumar-ss/AI_Resume` repository.
2. Render detects `render.yaml`. When prompted for environment variables:
   - `SUPABASE_DB_URL` — paste it (see step 3).
   - `SECRET_KEY` and `JWT_SECRET_KEY` — Render generates them automatically.
3. Click **Apply** and wait for the first build (a few minutes: `npm ci`,
   `pip install`, image build).

Your app is then live at `https://ai-resume.onrender.com` (rename the service
in Render to change the subdomain).

## 3. Supabase connection string

Supabase Dashboard → **Project Settings → Database → Connection string → URI**.

**Use the Session Pooler host** (`...pooler.supabase.com`, port `5432`):

- The free tier's direct host is **IPv6-only**, which Render cannot reach.
- The pooler speaks SQL over IPv4 and the URI already contains
  `sslmode=require`.

Example shape:

```
postgresql+psycopg://postgres.xxxxxxxx:[PASSWORD]@aws-0-xx-xx.pooler.supabase.com:5432/postgres
```

`config.py` also accepts plain `postgresql://` or `postgres://` URIs and
normalises them to the installed psycopg 3 driver. The database schema already
exists in Supabase — no migrations are needed for a first deploy.

## 4. Verify the deployment

- `https://<name>.onrender.com/api/health` → `{"status": "ok", ...}`
- Open the site URL → register → sign in → analyse a resume, take an
  assessment, view recommendations.
- Every push to `main` triggers an automatic redeploy.

## Notes

- **Free tier**: the service sleeps after ~15 minutes of inactivity; the first
  request after that takes 30–60 s (cold start).
- **Memory**: one preloaded gunicorn worker keeps the ML/NLP stack (scikit-learn,
  spaCy) shared in memory and inside the 512 MB free-tier limit; two threads
  handle requests concurrently.
- **Secrets** live only in Render's environment (and your local git-ignored
  `backend/.env`) — never in the repository.
- **Local development is unchanged**: `python run.py` + `npm run dev`, with
  the Vite proxy forwarding `/api` to the backend on port 5001. Flask only
  serves the static frontend when `SERVE_STATIC=true` or
  `RENDER_EXTERNAL_URL` is present (both set by Render), so tests and local
  runs keep their JSON 404s.
- **Custom domain later**: the single-service design keeps API and UI on one
  origin, so cookies continue to work — nothing to change.

## Alternative: split frontend and backend services

Not required. If you ever want a separate static site for the frontend:

1. Static site build: `npm ci && npm run build`, publish `frontend/dist`,
   set `VITE_API_BASE_URL=https://<api-name>.onrender.com/api` **at build time**.
2. API service: set `CORS_ORIGINS=https://<site-name>.onrender.com` and
   `JWT_COOKIE_DOMAIN=onrender.com` so the CSRF cookie stays readable across
   subdomains.

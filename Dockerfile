# ============================================================
# AI Resume — single-service build for Render
#
# Stage 1 builds the React frontend.
# Stage 2 runs the Flask API under gunicorn and serves the built
# frontend from the same origin, so auth cookies, the CSRF cookie
# and the API all live on one URL — no CORS in production.
# ============================================================

# ---- Stage 1: React + Vite build ----
FROM node:22-slim AS frontend
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Flask API + static site ----
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    SERVE_STATIC=true

# libgomp is the OpenMP runtime that scikit-learn wheels link against;
# slim images do not always ship it.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first so this layer is cached across code pushes.
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
# The app resolves the frontend build at ../frontend/dist relative to backend/,
# mirroring the repository layout.
COPY --from=frontend /build/dist ./frontend/dist

WORKDIR /app/backend
EXPOSE 10000

# ${PORT} is injected by Render. One preloaded worker keeps resident memory
# inside the free-tier 512 MB while model/ML modules stay shared in memory;
# threads handle concurrent requests.
CMD ["sh", "-c", "gunicorn --preload --workers 1 --threads 2 --timeout 120 --bind 0.0.0.0:${PORT:-10000} run:app"]

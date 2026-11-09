-- ============================================================
-- 001 — JWT logout / token invalidation
-- ============================================================
-- Adds a per-user version number. Every access token embeds the version it
-- was issued with; logout increments the column, so all older tokens stop
-- working. Safe to run more than once.
--
-- Apply with the Supabase SQL Editor or:
--   psql "<session-pooler-uri>" -f database/migrations/001_add_token_version.sql
-- ============================================================

alter table users
    add column if not exists token_version integer not null default 0;

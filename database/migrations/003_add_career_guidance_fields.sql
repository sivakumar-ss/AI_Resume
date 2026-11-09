-- Add career guidance fields used by the careers dataset.
-- Safe to re-run.

alter table careers
    add column if not exists learning_path text;

alter table careers
    add column if not exists prerequisites text;

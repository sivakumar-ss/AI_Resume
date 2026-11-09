-- ============================================================
-- 002 — Student profile management fields
-- ============================================================
-- Adds the education / college / experience fields used by the profile API.
-- `branch` already represents the student's department and is reused as the
-- API's `department` field, so no duplicate column is created.
--
-- Apply with the Supabase SQL Editor, or from psql with the session-pooler URI:
--   psql "<session-pooler-uri>" -f database/migrations/002_add_profile_fields.sql
--
-- Safe to run more than once.
-- ============================================================

alter table student_profiles
    add column if not exists education_level varchar(30) not null
        default 'undergraduate',
    add column if not exists college_name varchar(200),
    add column if not exists experience_level varchar(30) not null
        default 'beginner';

do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'ck_student_profiles_education_level'
          and conrelid = 'student_profiles'::regclass
    ) then
        alter table student_profiles
            add constraint ck_student_profiles_education_level check (
                education_level in (
                    'high_school', 'higher_secondary', 'diploma',
                    'undergraduate', 'postgraduate', 'doctorate'
                )
            );
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'ck_student_profiles_experience_level'
          and conrelid = 'student_profiles'::regclass
    ) then
        alter table student_profiles
            add constraint ck_student_profiles_experience_level check (
                experience_level in ('beginner', 'intermediate', 'advanced')
            );
    end if;
end
$$;

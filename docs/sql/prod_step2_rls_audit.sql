-- ONONNO Production Step 2 — RLS + published-only audit
-- Run in Supabase SQL Editor. Read-only checks first; optional policy notes at end.

-- 1) Cover columns
alter table public.lesson_contents
  add column if not exists cover_image_path text;
alter table public.lesson_contents
  add column if not exists cover_image_url text;

-- 2) Tables that should have RLS enabled (curriculum core)
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'curriculum_classes',
    'curriculum_subjects',
    'curriculum_chapters',
    'curriculum_lessons',
    'curriculum_sources',
    'lesson_contents',
    'profiles'
  )
order by c.relname;

-- 3) Policies on curriculum_lessons
select schemaname, tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where tablename in ('curriculum_lessons', 'lesson_contents', 'curriculum_sources')
order by tablename, policyname;

-- 4) Published vs draft counts
select
  count(*) filter (where is_published = true and coalesce(is_active, true) = true) as published_active,
  count(*) filter (where coalesce(workflow_status, '') = 'published') as workflow_published,
  count(*) filter (where coalesce(workflow_status, '') = 'archived' or is_active = false) as archived_or_inactive,
  count(*) as total_lessons
from public.curriculum_lessons;

-- 5) Sample: unpublished lessons must NOT be student-visible (manual expect)
select id, title, title_bn, is_published, is_active, workflow_status
from public.curriculum_lessons
where is_published = true
order by updated_at desc nulls last
limit 20;

-- 6) Optional harden (ONLY if no student SELECT policy exists for drafts).
-- Review existing policies BEFORE enabling. Uncomment if needed.
/*
-- Example: students read only published active lessons
-- drop policy if exists "students_read_published_lessons" on public.curriculum_lessons;
-- create policy "students_read_published_lessons"
--   on public.curriculum_lessons
--   for select
--   to authenticated
--   using (
--     is_published = true
--     and coalesce(is_active, true) = true
--     and coalesce(workflow_status, 'published') = 'published'
--   );

-- Admin full access (if not already covered)
-- create policy "admin_all_curriculum_lessons"
--   on public.curriculum_lessons
--   for all
--   to authenticated
--   using (
--     exists (
--       select 1 from public.profiles p
--       where p.id = auth.uid() and p.role = 'admin'
--     )
--   )
--   with check (
--     exists (
--       select 1 from public.profiles p
--       where p.id = auth.uid() and p.role = 'admin'
--     )
--   );
*/

-- Reconcile the two earlier curriculum import migrations.
-- Run this after the 20260816 migrations in Supabase SQL Editor.

alter table public.curriculum_import_runs
  add column if not exists extraction_model text,
  add column if not exists extracted_structure jsonb not null default '{"chapters": []}'::jsonb,
  add column if not exists created_by uuid references public.profiles(id),
  add column if not exists updated_at timestamptz not null default now();

update public.curriculum_import_runs
set extraction_model = coalesce(extraction_model, 'gemini-2.5-flash')
where extraction_model is null;

alter table public.curriculum_import_runs
  alter column extraction_model set default 'gemini-2.5-flash';

-- Both initial migrations used different status vocabularies. Keep one canonical set.
alter table public.curriculum_import_runs
  drop constraint if exists curriculum_import_runs_status_check;
alter table public.curriculum_import_runs
  add constraint curriculum_import_runs_status_check
  check (status in ('uploaded', 'extracting', 'extracted', 'reviewed', 'failed', 'archived'));

alter table public.curriculum_sources
  add column if not exists gemini_file_name text,
  add column if not exists gemini_file_expires_at timestamptz,
  add column if not exists checksum_sha256 text,
  add column if not exists extracted_structure jsonb,
  add column if not exists extraction_error text;

alter table public.curriculum_source_pages
  add column if not exists page_start integer,
  add column if not exists page_end integer;

create index if not exists curriculum_import_runs_status_idx
  on public.curriculum_import_runs(status, created_at desc);
create index if not exists curriculum_sources_checksum_idx
  on public.curriculum_sources(checksum_sha256);

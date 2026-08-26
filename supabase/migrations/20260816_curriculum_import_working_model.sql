-- PDF-first curriculum import working model.
-- Review the existing production schema before applying this migration.

create table if not exists public.curriculum_import_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.curriculum_sources(id) on delete cascade,
  status text not null default 'uploaded' check (status in ('uploaded', 'extracting', 'extracted', 'reviewed', 'archived')),
  extraction_model text not null,
  extracted_structure jsonb not null default '{"chapters": []}'::jsonb,
  error_message text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.curriculum_source_pages (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.curriculum_sources(id) on delete cascade,
  chapter_id uuid references public.curriculum_chapters(id) on delete set null,
  lesson_id uuid references public.curriculum_lessons(id) on delete set null,
  page_start integer not null check (page_start > 0),
  page_end integer not null check (page_end >= page_start),
  created_at timestamptz not null default now(),
  check (chapter_id is not null or lesson_id is not null)
);

alter table public.curriculum_sources
  add column if not exists curriculum_version_id uuid references public.curriculum_versions(id),
  add column if not exists page_count integer check (page_count > 0),
  add column if not exists source_status text not null default 'uploaded'
    check (source_status in ('uploaded', 'extracting', 'extracted', 'reviewed', 'archived')),
  add column if not exists gemini_file_uri text,
  add column if not exists checksum_sha256 text;

alter table public.curriculum_chapters
  add column if not exists workflow_status text not null default 'draft'
    check (workflow_status in ('draft', 'extracted', 'reviewed', 'generating', 'generated', 'approved', 'published', 'archived')),
  add column if not exists source_id uuid references public.curriculum_sources(id),
  add column if not exists source_page_start integer,
  add column if not exists source_page_end integer;

alter table public.curriculum_lessons
  add column if not exists workflow_status text not null default 'draft'
    check (workflow_status in ('draft', 'extracted', 'reviewed', 'generating', 'generated', 'approved', 'published', 'archived')),
  add column if not exists source_id uuid references public.curriculum_sources(id),
  add column if not exists source_page_start integer,
  add column if not exists source_page_end integer,
  add column if not exists approved_by uuid references public.profiles(id),
  add column if not exists approved_at timestamptz;

create index if not exists curriculum_import_runs_source_id_idx on public.curriculum_import_runs(source_id);
create index if not exists curriculum_source_pages_source_id_idx on public.curriculum_source_pages(source_id);
create index if not exists curriculum_lessons_workflow_status_idx on public.curriculum_lessons(workflow_status);

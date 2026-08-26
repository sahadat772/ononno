-- PDF-first, review-gated curriculum import pipeline.
-- Apply with the Supabase CLI or SQL editor before enabling the API routes.

create table if not exists public.curriculum_import_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'extracted', 'reviewed', 'failed', 'archived')),
  stage text not null default 'source' check (stage in ('source', 'structure', 'chapter', 'lesson', 'learning')),
  extracted_structure jsonb,
  error_message text,
  created_by uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.curriculum_sources
  add column if not exists curriculum_version_id uuid references public.curriculum_versions(id),
  add column if not exists page_count integer,
  add column if not exists gemini_file_name text,
  add column if not exists gemini_file_uri text,
  add column if not exists gemini_file_expires_at timestamptz,
  add column if not exists extracted_structure jsonb,
  add column if not exists extraction_error text,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.curriculum_source_pages (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.curriculum_sources(id) on delete cascade,
  page_number integer not null check (page_number > 0),
  page_label text,
  extracted_text text,
  created_at timestamptz not null default now(),
  unique(source_id, page_number)
);

alter table public.curriculum_chapters
  add column if not exists source_id uuid references public.curriculum_sources(id) on delete set null,
  add column if not exists page_start integer,
  add column if not exists page_end integer,
  add column if not exists workflow_status text not null default 'draft' check (workflow_status in ('draft', 'extracted', 'reviewed', 'generating', 'generated', 'approved', 'published')),
  add column if not exists reviewed_by uuid references public.profiles(id),
  add column if not exists reviewed_at timestamptz,
  add column if not exists published_at timestamptz;

alter table public.curriculum_lessons
  add column if not exists source_id uuid references public.curriculum_sources(id) on delete set null,
  add column if not exists page_start integer,
  add column if not exists page_end integer,
  add column if not exists workflow_status text not null default 'draft' check (workflow_status in ('draft', 'extracted', 'reviewed', 'generating', 'generated', 'approved', 'published')),
  add column if not exists reviewed_by uuid references public.profiles(id),
  add column if not exists reviewed_at timestamptz,
  add column if not exists published_at timestamptz;

create index if not exists curriculum_import_runs_source_id_idx on public.curriculum_import_runs(source_id, created_at desc);
create index if not exists curriculum_source_pages_source_id_idx on public.curriculum_source_pages(source_id, page_number);
create index if not exists curriculum_chapters_source_id_idx on public.curriculum_chapters(source_id, workflow_status);
create index if not exists curriculum_lessons_source_id_idx on public.curriculum_lessons(source_id, workflow_status);

alter table public.curriculum_import_runs enable row level security;
alter table public.curriculum_source_pages enable row level security;

create policy "Admin manages curriculum import runs" on public.curriculum_import_runs
  for all using ((select role from public.profiles where id = auth.uid()) = 'admin')
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Admin manages source page maps" on public.curriculum_source_pages
  for all using ((select role from public.profiles where id = auth.uid()) = 'admin')
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');

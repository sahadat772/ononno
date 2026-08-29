-- Additive schema reconciliation for PDF-first curriculum pipeline.
-- NON-DESTRUCTIVE: no DROP TABLE, no CASCADE recreation.

ALTER TABLE public.curriculum_sources
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS gemini_file_uri text,
  ADD COLUMN IF NOT EXISTS gemini_file_name text,
  ADD COLUMN IF NOT EXISTS gemini_file_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS extracted_structure jsonb,
  ADD COLUMN IF NOT EXISTS extraction_error text,
  ADD COLUMN IF NOT EXISTS mime_type text DEFAULT 'application/pdf',
  ADD COLUMN IF NOT EXISTS storage_provider text NOT NULL DEFAULT 'supabase',
  ADD COLUMN IF NOT EXISTS provider_file_id text;

UPDATE public.curriculum_sources
SET title = COALESCE(NULLIF(title, ''), file_name)
WHERE title IS NULL OR title = '';

ALTER TABLE public.curriculum_chapters
  ADD COLUMN IF NOT EXISTS page_start integer,
  ADD COLUMN IF NOT EXISTS page_end integer,
  ADD COLUMN IF NOT EXISTS source_page_start integer,
  ADD COLUMN IF NOT EXISTS source_page_end integer,
  ADD COLUMN IF NOT EXISTS source_id uuid REFERENCES public.curriculum_sources(id) ON DELETE SET NULL;

ALTER TABLE public.curriculum_lessons
  ADD COLUMN IF NOT EXISTS page_start integer,
  ADD COLUMN IF NOT EXISTS page_end integer,
  ADD COLUMN IF NOT EXISTS source_page_start integer,
  ADD COLUMN IF NOT EXISTS source_page_end integer,
  ADD COLUMN IF NOT EXISTS source_id uuid REFERENCES public.curriculum_sources(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS workflow_status text DEFAULT 'draft';

CREATE INDEX IF NOT EXISTS curriculum_sources_content_hash_idx
  ON public.curriculum_sources(content_hash)
  WHERE content_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS curriculum_sources_provider_file_idx
  ON public.curriculum_sources(storage_provider, provider_file_id)
  WHERE provider_file_id IS NOT NULL;

COMMENT ON COLUMN public.curriculum_sources.storage_provider IS
  'Storage backend identifier. Current default: supabase. Future: google_drive.';
COMMENT ON COLUMN public.curriculum_sources.provider_file_id IS
  'Provider-native file id (e.g. Drive file id). Null for path-based Supabase objects.';

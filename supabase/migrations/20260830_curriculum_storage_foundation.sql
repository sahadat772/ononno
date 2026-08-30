-- Phase 1 — Storage & Curriculum Source Foundation (additive only)
-- No DROP TABLE / DROP COLUMN / CASCADE recreation.

-- Ensure catalog filters are efficient
CREATE INDEX IF NOT EXISTS curriculum_sources_class_subject_provider_idx
  ON public.curriculum_sources(class_id, subject_id, storage_provider);

CREATE INDEX IF NOT EXISTS curriculum_sources_storage_path_idx
  ON public.curriculum_sources(storage_path);

-- Document canonical logical path (application-enforced)
COMMENT ON COLUMN public.curriculum_sources.storage_path IS
  'Provider object key. Canonical form: curriculum/class-{n}/{subjectSlug}/{file}.pdf. Business logic uses class_id/subject_id, not path parsing.';

COMMENT ON COLUMN public.curriculum_sources.content_hash IS
  'SHA-256 hex of PDF bytes for duplicate detection (DUPLICATE_SOURCE).';

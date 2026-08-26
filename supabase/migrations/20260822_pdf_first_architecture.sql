-- ============================================================================
-- PDF-First Curriculum Architecture Migration
-- ============================================================================
-- This migration implements class-wise, subject-wise PDF storage and extraction
-- with page mapping for granular lesson generation.
-- ============================================================================

-- 1. Drop old curriculum_sources table if exists (backup first)
DROP TABLE IF EXISTS curriculum_sources CASCADE;

-- 2. Recreate curriculum_sources with PDF-first schema
CREATE TABLE curriculum_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Curriculum hierarchy
  curriculum_version_id UUID REFERENCES curriculum_versions(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES curriculum_classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES curriculum_subjects(id) ON DELETE CASCADE,
  
  -- PDF metadata
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL, -- "class-1/bangla.pdf"
  content_hash TEXT,
  page_count INTEGER,
  
  -- Extraction metadata
  total_chapters INTEGER,
  total_lessons INTEGER,
  extraction_run_id UUID,
  
  -- Status tracking
  source_status TEXT NOT NULL DEFAULT 'uploaded'::text CHECK (source_status IN (
    'uploaded',        -- PDF uploaded to storage
    'extracting',      -- Gemini extraction in progress
    'extracted',       -- Structure extracted, awaiting review
    'reviewed',        -- Admin reviewed extraction
    'extraction_error' -- Extraction failed
  )),
  
  workflow_status TEXT NOT NULL DEFAULT 'draft'::text CHECK (workflow_status IN (
    'draft',
    'extracted',
    'reviewed',
    'generating',
    'generated',
    'approved',
    'published'
  )),
  
  -- Error tracking
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  UNIQUE(curriculum_version_id, class_id, subject_id), -- One PDF per version+class+subject
  CONSTRAINT file_size_valid CHECK (file_size > 0 AND file_size <= 52428800) -- 50MB max
);

CREATE INDEX idx_curriculum_sources_class_subject 
  ON curriculum_sources(class_id, subject_id, curriculum_version_id);
CREATE INDEX idx_curriculum_sources_status 
  ON curriculum_sources(source_status, workflow_status);

-- 3. Create curriculum_source_pages table for page mapping
CREATE TABLE curriculum_source_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  source_id UUID NOT NULL REFERENCES curriculum_sources(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES curriculum_chapters(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES curriculum_lessons(id) ON DELETE SET NULL,
  
  -- Page range in source PDF
  start_page INTEGER NOT NULL,
  end_page INTEGER NOT NULL,
  
  -- Page content preview
  content_preview TEXT,
  
  -- Extraction metadata
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_page_range CHECK (start_page > 0 AND end_page >= start_page),
  CONSTRAINT lesson_or_chapter CHECK (
    (lesson_id IS NOT NULL AND chapter_id IS NULL) OR
    (chapter_id IS NOT NULL AND lesson_id IS NULL)
  )
);

CREATE INDEX idx_curriculum_source_pages_source 
  ON curriculum_source_pages(source_id);
CREATE INDEX idx_curriculum_source_pages_lesson 
  ON curriculum_source_pages(lesson_id) WHERE lesson_id IS NOT NULL;
CREATE INDEX idx_curriculum_source_pages_chapter 
  ON curriculum_source_pages(chapter_id) WHERE chapter_id IS NOT NULL;

-- 4. Add source tracking to curriculum_lessons
ALTER TABLE curriculum_lessons ADD COLUMN IF NOT EXISTS source_page_start INTEGER;
ALTER TABLE curriculum_lessons ADD COLUMN IF NOT EXISTS source_page_end INTEGER;
ALTER TABLE curriculum_lessons ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES curriculum_sources(id) ON DELETE SET NULL;

CREATE INDEX idx_curriculum_lessons_source 
  ON curriculum_lessons(source_id) WHERE source_id IS NOT NULL;

-- 5. Add source tracking to curriculum_chapters
ALTER TABLE curriculum_chapters ADD COLUMN IF NOT EXISTS source_page_start INTEGER;
ALTER TABLE curriculum_chapters ADD COLUMN IF NOT EXISTS source_page_end INTEGER;
ALTER TABLE curriculum_chapters ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES curriculum_sources(id) ON DELETE SET NULL;

CREATE INDEX idx_curriculum_chapters_source 
  ON curriculum_chapters(source_id) WHERE source_id IS NOT NULL;

-- 6. Add workflow_status to curriculum_lessons if not exists
ALTER TABLE curriculum_lessons ADD COLUMN IF NOT EXISTS workflow_status TEXT DEFAULT 'draft'::text;
ALTER TABLE curriculum_lessons ADD CONSTRAINT curriculum_lessons_workflow_status_check CHECK (
  workflow_status IN ('draft', 'extracted', 'reviewed', 'generating', 'generated', 'approved', 'published')
);

CREATE INDEX idx_curriculum_lessons_workflow_status 
  ON curriculum_lessons(workflow_status);

-- 7. Update curriculum_versions with PDF import tracking
ALTER TABLE curriculum_versions ADD COLUMN IF NOT EXISTS import_status TEXT DEFAULT 'pending'::text;
ALTER TABLE curriculum_versions ADD CONSTRAINT curriculum_versions_import_status_check CHECK (
  import_status IN ('pending', 'importing', 'import_complete', 'import_error')
);

-- 8. Audit table for extraction runs
CREATE TABLE IF NOT EXISTS curriculum_extraction_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  source_id UUID NOT NULL REFERENCES curriculum_sources(id) ON DELETE CASCADE,
  run_status TEXT NOT NULL CHECK (run_status IN ('pending', 'running', 'completed', 'failed')),
  
  extraction_type TEXT NOT NULL CHECK (extraction_type IN ('full', 'partial')),
  start_page INTEGER,
  end_page INTEGER,
  
  chapters_found INTEGER,
  lessons_found INTEGER,
  
  gemini_request_tokens INTEGER,
  gemini_response_tokens INTEGER,
  
  error_message TEXT,
  error_details JSONB,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_curriculum_extraction_runs_source 
  ON curriculum_extraction_runs(source_id);
CREATE INDEX idx_curriculum_extraction_runs_status 
  ON curriculum_extraction_runs(run_status);

-- 9. RLS Policies for curriculum_sources
ALTER TABLE curriculum_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_sources" ON curriculum_sources
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "public_published_sources" ON curriculum_sources
  FOR SELECT USING (
    workflow_status = 'published'
  );

-- 10. RLS for curriculum_source_pages
ALTER TABLE curriculum_source_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_source_pages" ON curriculum_source_pages
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "public_published_source_pages" ON curriculum_source_pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM curriculum_sources
      WHERE curriculum_sources.id = curriculum_source_pages.source_id
      AND curriculum_sources.workflow_status = 'published'
    )
  );

-- 11. RLS for extraction runs
ALTER TABLE curriculum_extraction_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_extraction_runs" ON curriculum_extraction_runs
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- 12. Storage policy for private PDFs (already exists, but ensure it's correct)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, owner, created_at, updated_at)
VALUES (
  'curriculum-pdfs',
  'curriculum-pdfs',
  FALSE,
  52428800,
  '{"application/pdf"}',
  NULL,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = 52428800,
  allowed_mime_types = '{"application/pdf"}';

-- 13. Storage policies for private bucket
DELETE FROM storage.objects WHERE bucket_id = 'curriculum-pdfs'; -- Clean if re-running

-- Admin can upload
INSERT INTO storage.policies (bucket_id, name, definition, check, operation, role)
VALUES (
  'curriculum-pdfs',
  'admin_upload_pdf',
  '{"foldername":{"eq":""},"owner_id":{"eq":""}}',
  'auth.jwt() ->> ''role'' = ''admin''',
  'INSERT',
  'authenticated'
)
ON CONFLICT DO NOTHING;

-- Admin can download
INSERT INTO storage.policies (bucket_id, name, definition, check, operation, role)
VALUES (
  'curriculum-pdfs',
  'admin_download_pdf',
  NULL,
  'auth.jwt() ->> ''role'' = ''admin''',
  'SELECT',
  'authenticated'
)
ON CONFLICT DO NOTHING;

-- Admin can update
INSERT INTO storage.policies (bucket_id, name, definition, check, operation, role)
VALUES (
  'curriculum-pdfs',
  'admin_update_pdf',
  NULL,
  'auth.jwt() ->> ''role'' = ''admin''',
  'UPDATE',
  'authenticated'
)
ON CONFLICT DO NOTHING;

-- Admin can delete
INSERT INTO storage.policies (bucket_id, name, definition, check, operation, role)
VALUES (
  'curriculum-pdfs',
  'admin_delete_pdf',
  NULL,
  'auth.jwt() ->> ''role'' = ''admin''',
  'DELETE',
  'authenticated'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Migration complete
-- ============================================================================

-- ============================================================================
-- PHASE 2 — Study Sessions (Student Learning Experience)
-- Planner uses ONLY published curriculum. No PDF extract / Gemini curriculum gen.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  class_id uuid REFERENCES public.curriculum_classes(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES public.curriculum_subjects(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES public.curriculum_chapters(id) ON DELETE SET NULL,

  planned_minutes integer NOT NULL CHECK (planned_minutes >= 5 AND planned_minutes <= 240),
  actual_seconds integer NOT NULL DEFAULT 0 CHECK (actual_seconds >= 0),

  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'active', 'completed', 'abandoned', 'paused')),

  started_at timestamptz,
  completed_at timestamptz,
  last_heartbeat_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_student
  ON public.study_sessions(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_status
  ON public.study_sessions(student_id, status);

CREATE TABLE IF NOT EXISTS public.study_session_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.curriculum_lessons(id) ON DELETE CASCADE,

  position integer NOT NULL DEFAULT 0,
  planned_minutes integer NOT NULL DEFAULT 15 CHECK (planned_minutes >= 1),
  item_type text NOT NULL DEFAULT 'lesson'
    CHECK (item_type IN ('lesson', 'review', 'quiz', 'summary')),

  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'completed', 'skipped')),

  started_at timestamptz,
  completed_at timestamptz,
  quiz_score integer,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_study_session_items_session
  ON public.study_session_items(session_id, position);

-- RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_session_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_own_sessions" ON public.study_sessions;
CREATE POLICY "students_own_sessions" ON public.study_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "admin_read_sessions" ON public.study_sessions;
CREATE POLICY "admin_read_sessions" ON public.study_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "students_own_session_items" ON public.study_session_items;
CREATE POLICY "students_own_session_items" ON public.study_session_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.study_sessions s
      WHERE s.id = study_session_items.session_id
        AND s.student_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.study_sessions s
      WHERE s.id = study_session_items.session_id
        AND s.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admin_read_session_items" ON public.study_session_items;
CREATE POLICY "admin_read_session_items" ON public.study_session_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

COMMENT ON TABLE public.study_sessions IS
  'Phase 2: student study planner sessions over published curriculum only';
COMMENT ON TABLE public.study_session_items IS
  'Lessons/quiz/review blocks inside a study session';

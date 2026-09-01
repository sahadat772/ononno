-- Store admin/AI-generated MCQ for each lesson (student-safe, no live AI required)
ALTER TABLE public.lesson_contents
  ADD COLUMN IF NOT EXISTS quiz_questions jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.lesson_contents.quiz_questions IS
  'Array of {question, options[], correct, explanation} for step-by-step student quiz';

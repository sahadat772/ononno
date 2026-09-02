-- Slice B — Lesson cover image (additive only)
-- Run in Supabase SQL editor if not auto-applied.

ALTER TABLE public.lesson_contents
  ADD COLUMN IF NOT EXISTS cover_image_path text;

ALTER TABLE public.lesson_contents
  ADD COLUMN IF NOT EXISTS cover_image_url text;

COMMENT ON COLUMN public.lesson_contents.cover_image_path IS
  'Storage object key under curriculum-pdfs bucket, e.g. covers/lesson-{uuid}.png';

COMMENT ON COLUMN public.lesson_contents.cover_image_url IS
  'Optional cached public/signed URL; prefer regenerating signed URL from path.';

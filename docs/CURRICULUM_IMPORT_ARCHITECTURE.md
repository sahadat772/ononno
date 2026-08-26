# Curriculum Import Architecture

## Source of truth

`Curriculum Version → Class → Subject → Chapter → Lesson` is the authoritative curriculum hierarchy.
`curriculum_sources` is the source layer. It records the original NCTB PDF without turning the PDF itself into a lesson.

## Controlled workflow

1. Admin uploads one official PDF to the `curriculum-pdfs` Storage bucket.
2. The application creates a `curriculum_sources` record.
3. Gemini Files API receives a reusable copy of the PDF and returns only the table-of-contents structure: chapter, lesson and page ranges.
4. The structure is previewed in the admin workbench.
5. Admin saves it as an `extracted` review draft. This creates chapter and lesson records, still unpublished.
6. Admin reviews/edit records in the CMS.
7. Each lesson is generated and approved individually before publication.

AI must never directly publish curriculum content. The source layer remains separate from learning content so that NCTB fact mapping can always be audited.

## Workflow states

`draft → extracted → reviewed → generating → generated → approved → published`

Only `published` records may be exposed to learners. `extracted` is a review state, not a student-visible state.

## Operational prerequisites

- Apply `supabase/migrations/20260816_curriculum_import_pipeline.sql` to the target Supabase project.
- Create the `curriculum-pdfs` Storage bucket and use private access in production; the server route downloads the object and sends it to Gemini.
- Configure `GEMINI_API_KEY` server-side only.
- Gemini Files API copies are short-lived. The database persists the source PDF in Supabase Storage and caches the Gemini file URI only for reuse.
- Add a background job/queue before processing large volumes. The current route is intentionally synchronous for a single-admin working model.

## Safety rules

- Extract only titles and page mapping that are supported by the uploaded source.
- Keep source page ranges on chapter/lesson records.
- Treat AI teaching content as a draft; retain source references and require admin approval.
- Do not use public storage URLs for private textbook material unless licensing permits it.

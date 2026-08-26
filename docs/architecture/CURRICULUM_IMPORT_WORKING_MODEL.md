# Ononno Curriculum Import Working Model

## Decision

Ononno uses a **PDF-first, controlled, chapter-by-chapter** curriculum workflow.
The source curriculum and AI-created learning material are deliberately separate.

```text
NCTB PDF → Source record → Structure extraction → Admin review
         → Chapter map → Lesson generation → Admin approval → Publish
```

## Source of truth

```text
curriculum_version → curriculum_class → curriculum_subject
                   → curriculum_chapter → curriculum_lesson
```

The source layer stores what the official book says. The learning layer stores
explanations and resources designed for learners. AI may improve the learning
experience but must not silently alter source facts, order, or scope.

## Status lifecycle

| Entity | Allowed lifecycle |
| --- | --- |
| Source | `uploaded → extracting → extracted → reviewed → archived` |
| Chapter / lesson | `draft → extracted → reviewed → generating → generated → approved → published` |
| Learning content | `draft → generated → approved → published → archived` |

Only an admin can move content to `approved` or `published`.

## Import workflow

1. Admin creates/selects curriculum version, class, and subject.
2. Admin uploads the official PDF to the private `curriculum-pdfs` bucket.
3. A `curriculum_sources` record stores metadata and the storage path.
4. Gemini extracts only the table of contents and page ranges.
5. The system creates a reviewable chapter/lesson map in `extracted` state.
6. Admin corrects or approves that map.
7. A single lesson is generated from its mapped pages; it never generates an
   entire book in one request.
8. Admin reviews the learning content/resources and publishes it.
9. Student-facing queries may return only `published` content.

## AI guardrails

- PDF/page range is retained with every extraction and generated lesson.
- AI output is a draft, never an auto-publish action.
- Prompt, model, generation timestamp, and source-page references are saved.
- Content generation is idempotent per lesson revision.
- Failed jobs remain retryable; no partially generated lesson is published.

## Implementation order

1. Apply the schema migration in `supabase/migrations/` and configure private
   storage/RLS policies.
2. Replace the current version placeholder with full version CRUD.
3. Wire the existing upload and Gemini extraction UI to the new import run
   records.
4. Build the review screen for extracted chapter/lesson maps.
5. Add per-lesson generation, approval, and publish endpoints.
6. Switch student academic pages from legacy `class_lessons` tables to this
   single `curriculum_*` hierarchy.

## Non-goals for the first release

- Generating an entire textbook in one AI request.
- Direct, unreviewed publishing by an AI model.
- Scraping the NCTB website as the authoritative source.
- Treating AI explanations as replacements for official source material.

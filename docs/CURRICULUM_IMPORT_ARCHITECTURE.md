# Curriculum Import Architecture (Phase 1 foundation)

## Canonical table

`curriculum_sources` is the only curriculum PDF source table.

## Storage

See `docs/CURRICULUM_STORAGE.md`.

- Abstraction: `CurriculumStorageProvider`
- Test: Supabase `curriculum-pdfs`
- Production target: Google Drive (Phase 10)
- Path convention: `curriculum/class-{n}/{subjectSlug}/{file}.pdf`

## Canonical API

| Method | Path | Role |
|--------|------|------|
| GET | `/api/admin/curriculum/sources` | Catalog list (class/subject/provider filters) |
| GET | `/api/admin/curriculum/sources/[sourceId]` | Catalog detail |
| POST | `/api/admin/curriculum/sources` | Seed/register PDF (ops; Phase 2 UI is no-upload) |
| POST | `/api/admin/curriculum/sources/[sourceId]/extract-structure` | Structure extract (later phases) |
| POST | `/api/admin/curriculum/sources/[sourceId]/commit-structure` | Commit chapters/lessons |
| POST | `/api/admin/curriculum/lessons/[id]/generate` | Study draft (reviewed only) |
| POST | `/api/admin/curriculum/lessons/[id]/workflow` | review / approve / publish |

`/api/admin/curriculum/pdf-sources` is **deprecated compatibility**.

## Page range mapping

Application: `page_start` / `page_end`  
DB dual-write: also `source_page_start` / `source_page_end`  
Helpers: `src/lib/page-fields.ts`

## Gemini standard

- SDK: `@google/genai` only
- Key: `GEMINI_API_KEY` only
- Client: `src/lib/gemini.ts`
- Model: `gemini-2.5-flash`

## Upload integrity

SHA-256 → `content_hash`. Duplicate → 409 `DUPLICATE_SOURCE`.

## Migrations (additive)

- `20260829_curriculum_schema_reconciliation.sql`
- `20260830_curriculum_storage_foundation.sql`

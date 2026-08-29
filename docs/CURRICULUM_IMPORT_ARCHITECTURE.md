# Curriculum Import Architecture (Phase 1 reconciled)

## Canonical table
`curriculum_sources` is the only curriculum PDF source table.

## Canonical API
| Method | Path | Role |
|--------|------|------|
| GET/POST | `/api/admin/curriculum/sources` | Upload + list (canonical) |
| POST | `/api/admin/curriculum/sources/[sourceId]/extract-structure` | Incremental structure extract |
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

## Storage abstraction
`src/lib/storage/` — Supabase provider active; Google Drive future.

## Upload integrity
SHA-256 → `content_hash`. Duplicate → 409 `DUPLICATE_SOURCE`.

## Migration
`supabase/migrations/20260829_curriculum_schema_reconciliation.sql` (additive only)

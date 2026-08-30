# Curriculum Storage Foundation (Phase 1)

## Abstraction

```text
API / Service
     ↓
CurriculumStorageProvider
     ├── supabase   (test / current)
     └── google_drive (Phase 10 — interface only)
```

Code entry: `src/lib/storage/`

- `createCurriculumStorage(supabase, provider?)` — factory
- `getDefaultStorageProviderName()` — env `CURRICULUM_STORAGE_PROVIDER` (default `supabase`)
- Never call `supabase.storage.from(...)` from route handlers for curriculum PDFs; use the provider.

## Canonical logical path

```text
curriculum/class-{classNumber}/{subjectSlug}/{fileName}.pdf
```

Example: `curriculum/class-6/bangla/bangla.pdf`

**Business logic uses DB ids** (`class_id`, `subject_id`), not folder-name parsing.

Helpers: `buildCurriculumFolderPath`, `buildCurriculumPdfPath` in `src/lib/storage/paths.ts`.

## Bucket (Supabase)

- Bucket id: `curriculum-pdfs` (private)
- Admin RLS only (see migration `20260821_curriculum_pdf_storage.sql`)

## Catalog table

`curriculum_sources` is the only PDF source catalog table.

Key fields: `class_id`, `subject_id`, `storage_provider`, `storage_path`, `provider_file_id`, `content_hash`.

Duplicate PDF bytes → `409 DUPLICATE_SOURCE` via SHA-256 `content_hash`.

## Admin APIs (Phase 1)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/admin/curriculum/sources` | Filters: `class_id`, `subject_id`, `storage_provider`, `source_status` |
| GET | `/api/admin/curriculum/sources/[sourceId]` | Detail + optional `storage_exists` |
| POST | `/api/admin/curriculum/sources` | Ops/seed registration (hash + provider upload). Steady-state Import UI is Phase 2 (no-upload catalog). |

All require `requireRole(['admin'])`.

## Google Drive

Not implemented in Phase 1. Selecting `google_drive` throws `GOOGLE_DRIVE_NOT_IMPLEMENTED`.  
No Drive credentials in client, `NEXT_PUBLIC_*`, or browser bundles.

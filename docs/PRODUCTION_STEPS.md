# ONONNO — Production work steps (runtime)

Conversation track for soft-launch production tasks.

| Step | Task | Status |
|------|------|--------|
| 1 | Live payment gateway | ⏸ Skipped for now — **manual bKash/Nagad** polished instead |
| 2 | Curriculum baseline seed (Class 1–5) | ✅ Admin API + Seed Baseline button |
| 3 | Soft-launch hardening | ✅ Health checks, robots/sitemap, unlock constant |
| 4 | Richer published lesson bodies / QA path | ✅ Demo bodies + seed lesson_contents |
| 5 | Error monitoring (optional Sentry) | ✅ /api/errors + boundaries + DSN forward |

## Step 3 details

1. **`GET /api/health`** — Supabase, AI key, Drive, payment_mode, unlock 60%
2. **SEO** — robots + sitemap public routes
3. **Unlock** — `CURRICULUM_UNLOCK_THRESHOLD_PCT = 60`

## Step 4 details

1. **`src/lib/lesson-demo-content.ts`** — subject-aware Bengali lesson body + quiz generator
2. **Fallback lessons** — rich overview / main_content / quiz
3. **Curriculum seed** — inserts `lesson_contents` rows for each seeded lesson
4. **Student lesson page** — if published lesson has empty body, fills demo content automatically

**Note:** Existing DB lessons without `lesson_contents` still get demo body at read-time. Re-seed with `force: true` only if you intentionally want to rebuild baseline (careful in prod).

## Step 5 details

1. **`POST /api/errors`** — client error intake (rate-limited)
2. **`error.tsx` / `global-error.tsx`** — user-friendly BN UI + auto report
3. **`monitoring.ts`** — server `reportError`; optional Sentry store API when `SENTRY_DSN` set
4. **`instrumentation.ts`** — unhandledRejection / uncaughtException logs
5. Docs: `docs/ERROR_MONITORING.md`

Set `SENTRY_DSN` in Vercel to enable Sentry. Without it, errors still show in Vercel logs.

## Verify after deploy

```text
https://ononno-two.vercel.app/api/health
POST /api/errors smoke test (see ERROR_MONITORING.md)
Student: Class 1 → বাংলা → অধ্যায় → পাঠ → কুইজ
```

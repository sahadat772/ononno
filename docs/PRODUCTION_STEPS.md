# ONONNO — Production work steps (runtime)

Conversation track for soft-launch production tasks.

| Step | Task | Status |
|------|------|--------|
| 1 | Live payment gateway | ⏸ Skipped for now — **manual bKash/Nagad** polished instead |
| 2 | Curriculum baseline seed (Class 1–5) | ✅ Admin API + Seed Baseline button |
| 3 | Soft-launch hardening | ✅ Health checks, robots/sitemap, unlock constant |
| 4 | Richer published lesson bodies / QA path | ✅ Demo bodies + seed lesson_contents |
| 5 | Error monitoring (optional Sentry) | ✅ /api/errors + boundaries + DSN forward |
| 6 | Soft-launch readiness console | ✅ Admin readiness API + UI |

## Step 6 details

1. **`GET /api/admin/readiness`** — env, curriculum coverage, ops queue, monitoring
2. **`/dashboard/admin/readiness`** — checklist UI + backfill/seed shortcuts
3. Admin Overview module + nav link: **Readiness**

Open after deploy: `https://ononno-two.vercel.app/dashboard/admin/readiness`

## Verify after deploy

```text
https://ononno-two.vercel.app/api/health
https://ononno-two.vercel.app/dashboard/admin/readiness
POST /api/errors smoke test
Student: Class 1 → বাংলা → অধ্যায় → পাঠ → কুইজ
```

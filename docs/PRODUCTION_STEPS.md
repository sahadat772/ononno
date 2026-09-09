# ONONNO — Production work steps (runtime)

Conversation track for soft-launch production tasks.

| Step | Task | Status |
|------|------|--------|
| 1 | Live payment gateway | ⏸ Skipped for now — **manual bKash/Nagad** polished instead |
| 2 | Curriculum baseline seed (Class 1–5) | ✅ Admin API + Seed Baseline button |
| 3 | Soft-launch hardening | ✅ Health checks, robots/sitemap, unlock constant |
| 4 | (Next) More published lesson bodies / QA path | Pending |
| 5 | (Next) Error monitoring (Sentry) optional | Pending |

## Step 3 details

1. **`GET /api/health`**
   - Checks Supabase public URL + key
   - AI key (Groq or Gemini)
   - Drive readiness if storage provider is google_drive
   - Reports `payment_mode: manual` and unlock threshold `60`

2. **SEO**
   - `robots.ts` allows `/`, `/login`, `/register`, `/contact`, `/free-access`
   - Blocks `/dashboard/`, `/api/`, `/auth/`
   - `sitemap.ts` lists public marketing pages

3. **Unlock rules**
   - Shared constant `CURRICULUM_UNLOCK_THRESHOLD_PCT = 60` in `src/lib/curriculum-unlock.ts`

## Verify after deploy

```text
https://ononno-two.vercel.app/api/health
https://ononno-two.vercel.app/robots.txt
https://ononno-two.vercel.app/sitemap.xml
```

Student path: Class 1 → subject → chapter → lesson → quiz → progress %.

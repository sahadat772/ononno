# ONONNO — Production Launch Checklist

**Goal:** Public students can safely learn from published NCTB curriculum only.

Core rule remains:

```text
AI generates → Admin reviews → Publish → Student learns
```

---

## Phase P0 — Must before public launch

### 1. Build green
- [ ] Latest `main` deploys on Vercel without TypeScript/build errors
- [ ] Open `https://YOUR_DOMAIN/api/health` → `"status":"ok"`

### 2. Environment variables (Vercel Production)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` **and/or** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (server only — never expose to client)
- [ ] `GEMINI_API_KEY`
- [ ] `GROQ_API_KEY` (chat/kids if used)
- [ ] `CURRICULUM_STORAGE_PROVIDER` = `supabase` or `google_drive`
- [ ] If Drive: `GOOGLE_DRIVE_CLIENT_EMAIL`, `GOOGLE_DRIVE_PRIVATE_KEY`, `GOOGLE_DRIVE_FOLDER_ID`
- [ ] `COVER_IMAGE_PROVIDER=branded` (recommended for dignity)
- [ ] `NEXT_PUBLIC_APP_URL` = production domain

### 3. Supabase Auth URLs
Dashboard → Authentication → URL Configuration:
- [ ] Site URL = production domain
- [ ] Redirect allowlist includes:
  - `https://YOUR_DOMAIN/**`
  - `https://*.vercel.app/**` (preview)
  - `/auth/callback` paths used by app

### 4. Database readiness
Run in Supabase SQL Editor:

```sql
-- Cover columns (lesson media)
alter table public.lesson_contents
  add column if not exists cover_image_path text;
alter table public.lesson_contents
  add column if not exists cover_image_url text;
```

- [ ] Cover columns exist
- [ ] RLS enabled on curriculum + lesson tables
- [ ] Students can only read `workflow_status = 'published'` / `is_published = true` content
- [ ] Admin role checked via `profiles.role = 'admin'`

### 5. Storage
- [ ] Bucket `curriculum-pdfs` exists
- [ ] Admin can upload; students cannot list private PDFs
- [ ] Google Drive root folder shared with **service account email** as Editor (if using Drive)

### 6. Security smoke test
- [ ] Logged-out user cannot open `/dashboard/*`
- [ ] Student cannot call `/api/admin/*` successfully
- [ ] Service role key not present in browser Network responses
- [ ] Payment keys are sandbox until go-live decision

### 7. Curriculum content QA
- [ ] At least 1 Class + Subject fully: Extract → Review → Generate → Approve → Publish
- [ ] Student Learning dashboard shows published lessons only
- [ ] Quiz + XP work on one lesson end-to-end
- [ ] Lock/unlock next lesson works

### 8. Payments (when charging)
- [ ] Switch bKash/SSLCommerz to **live** credentials
- [ ] `SSLCOMMERZ_IS_LIVE=true`
- [ ] Test one real small payment + admin approval path

---

## Phase P1 — Soft launch polish

- [ ] Custom domain + SSL on Vercel
- [ ] robots.txt / sitemap (SEO)
- [ ] Error monitoring (Sentry or Vercel logs watch)
- [ ] Backup policy for Supabase (Point-in-time recovery if paid plan)
- [ ] Rate limits verified under load for Gemini routes

---

## Phase P2 — Post-launch product

- Adventure missions / real-world tasks
- Parent dashboard insights
- Paid high-quality lesson images
- Deeper analytics

---

## Current recommended order of work

1. **This week:** P0 items 1–7 (stable public beta)
2. **Next:** Custom domain + payments live
3. **Later:** Adventure / parent features from Master Blueprint

Do **not** block launch on perfect AI cover art — use branded covers.

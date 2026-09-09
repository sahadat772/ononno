# ONONNO — Production Launch Checklist

**Goal:** Public students can safely learn from published NCTB curriculum only.

Core rule:

```text
AI generates → Admin reviews → Publish → Student learns
```

**Status (2026-09-06):** Soft-launch **READY** for limited public beta on  
`https://ononno-two.vercel.app` — after latest `main` deploy.

---

## Completed (P0)

| Area | Status |
|------|--------|
| Health `/api/health` | ✅ |
| Env (Supabase + Gemini + Drive) | ✅ |
| Auth Site URL + Redirects | ✅ |
| Content QA (publish + student path + progress) | ✅ |
| Security smoke (admin API role, student isolation) | ✅ |
| Cover images (branded default) | ✅ |
| robots.txt + sitemap | ✅ |
| Non-admin blocked from `/dashboard/admin` (proxy) | ✅ |

---

## Soft launch — do this once after deploy

1. Deploy latest `main` on Vercel (Production).
2. Open `https://ononno-two.vercel.app/api/health`  
   → `"status":"ok"` and `"phase":"soft_launch"`.
3. Student login → Class 1 বাংলা → one lesson → quiz → progress %.
4. Student tries `/dashboard/admin` → redirect away (not admin UI).
5. Admin login → curriculum import/publish still works.

Optional public checks:

- `https://ononno-two.vercel.app/robots.txt`
- `https://ononno-two.vercel.app/sitemap.xml`

---

## Runtime production steps (this sprint)

| Step | Task | Status |
|------|------|--------|
| 1 | Live gateway | ⏸ Manual payment polished instead |
| 2 | Curriculum seed Class 1–5 | ✅ |
| 3 | Soft-launch hardening (health + SEO + unlock const) | ✅ |
| 4 | Richer published lesson bodies | ✅ |
| 5 | Error monitoring (optional Sentry) | ✅ |
| Next | Real NCTB content / custom domain | Pending |

See also `docs/PRODUCTION_STEPS.md` and `docs/ERROR_MONITORING.md`.

---

## Phase P1 — After soft launch (not blockers)

- [ ] Custom domain (e.g. `ononno.app`) + SSL
- [x] Error monitoring (Vercel logs / optional Sentry DSN)
- [ ] Supabase backup / PITR if plan allows
- [ ] Live bKash / SSLCommerz when charging
- [ ] More Class 1–5 subjects published

## Phase P2 — Product roadmap

- Adventure missions / real-world tasks
- Parent insights
- Higher-quality lesson images (paid API)
- Deeper learning analytics

---

## Launch decision

**Soft launch (beta):** ✅ Allowed now — limited users, Class 1 বাংলা path proven.

**Wide public marketing:** After custom domain + 2–3 more subjects published + payment decision.

Do **not** block launch on perfect AI cover art — branded covers are intentional.

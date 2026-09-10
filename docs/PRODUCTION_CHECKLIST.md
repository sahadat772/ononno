# ONONNO — Production Launch Checklist

**Goal:** Public students can safely learn from published NCTB curriculum only.

Core rule:

```text
AI generates → Admin reviews → Publish → Student learns
```

**Status:** Soft-launch **READY** for limited public beta on  
`https://ononno-two.vercel.app` — after latest `main` deploy.

---

## Runtime production steps (this sprint)

| Step | Task | Status |
|------|------|--------|
| 1 | Live gateway | ⏸ Manual payment polished instead |
| 2 | Curriculum seed Class 1–5 | ✅ |
| 3 | Soft-launch hardening (health + SEO + unlock const) | ✅ |
| 4 | Richer published lesson bodies | ✅ |
| 5 | Error monitoring (optional Sentry) | ✅ |
| 6 | Soft-launch readiness console | ✅ |
| Next | Real NCTB content / custom domain | Pending |

See `docs/PRODUCTION_STEPS.md` and `/dashboard/admin/readiness`.

---

## Soft launch — do this once after deploy

1. Deploy latest `main` on Vercel (Production).
2. Open `https://ononno-two.vercel.app/api/health` → `"status":"ok"`.
3. Admin → **Readiness** → fix any ❌ checks (Seed / Backfill).
4. Student login → Class 1 বাংলা → lesson → quiz → progress %.
5. Student tries `/dashboard/admin` → redirect away.

---

## Phase P1 — After soft launch (not blockers)

- [ ] Custom domain (e.g. `ononno.app`) + SSL
- [x] Error monitoring (Vercel logs / optional Sentry DSN)
- [ ] Supabase backup / PITR if plan allows
- [ ] Live bKash / SSLCommerz when charging
- [ ] More Class 1–5 subjects published (real NCTB)

## Launch decision

**Soft launch (beta):** ✅ Allowed — limited users, Class 1 path + readiness console.

**Wide public marketing:** After custom domain + richer real content + payment decision.

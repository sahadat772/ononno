# ONONNO — Production work steps (runtime)

| Step | Task | Status |
|------|------|--------|
| 1 | Live payment gateway | ⏸ Manual bKash/Nagad polished |
| 2 | Curriculum baseline seed (Class 1–5) | ✅ |
| 3 | Soft-launch hardening | ✅ |
| 4 | Richer published lesson bodies | ✅ |
| 5 | Error monitoring (optional Sentry) | ✅ |
| 6 | Soft-launch readiness console | ✅ |
| 7 | Student soft-launch experience | ✅ Free tier 5/day + hub banner |
| 8 | Continue learning on student hub | ✅ API + resume card |
| 9 | Parent soft-launch summary | ✅ Weekly snapshot card |

## Step 9 details

1. **`GET /api/parent/soft-launch-summary`** — linked children progress (week + total)
2. **`ParentSoftLaunchCard`** on parent dashboard
3. Empty state → create-child CTA

Verify: parent login → soft-launch progress card.

```text
https://ononno-two.vercel.app/dashboard/parent
```

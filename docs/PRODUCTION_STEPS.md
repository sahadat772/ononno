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

## Step 8 details

1. **`GET /api/student/continue-learning`** — latest academic progress → deep link
2. **`ContinueLearningCard`** on student dashboard (under soft-launch banner)
3. No progress → CTA to `/dashboard/student/academic`

Verify: complete/start a lesson → hub shows **চালিয়ে যাও** with correct link.

## Verify after deploy

```text
https://ononno-two.vercel.app/dashboard/student
```

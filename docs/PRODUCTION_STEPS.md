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

## Step 7 details

1. **`src/lib/soft-launch.ts`** — free lessons/day (default **5**, env `NEXT_PUBLIC_SOFT_LAUNCH_FREE_LESSONS`)
2. **`useAccess`** — soft-launch limit
3. **`SoftLaunchBanner`** on student dashboard

Verify: student login → hub banner → Academic.

## Verify after deploy

```text
https://ononno-two.vercel.app/dashboard/student
https://ononno-two.vercel.app/dashboard/admin/readiness
https://ononno-two.vercel.app/api/health
```

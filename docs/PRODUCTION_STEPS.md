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
| 10 | Real NCTB content expand | ✅ 7 subjects + expand API |

## Step 10 — Real NCTB content

1. Expanded seed: বাংলা · ইংরেজি · গণিত · ইসলাম · বিজ্ঞান · **বাংলাদেশ ও বিশ্বপরিচয়** · **স্বাস্থ্য**
2. Class 3–5 richer chapters (place value, multiplication, history map, etc.)
3. **`POST /api/admin/curriculum/expand-nctb`** — safe merge (no delete)
4. Admin Curriculum → **Expand NCTB** button

Run once after deploy: Admin → Curriculum → **Expand NCTB** → refresh page.

```text
https://ononno-two.vercel.app/dashboard/admin/curriculum
```

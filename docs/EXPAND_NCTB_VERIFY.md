# Expand NCTB — Verify checklist

## 1. Deploy
Latest `main` on Vercel Production.

## 2. Run expand (admin logged in)
1. Open https://ononno-two.vercel.app/dashboard/admin/readiness
2. Click **📚 Expand NCTB (Class 1–8)**
3. Expect summary: `+Subject`, `+Chapter`, `+Lesson` (0 is OK if already expanded)

## 3. Verify in Admin Curriculum
- Classes include **class-6, class-7, class-8**
- Class 6 subjects: বাংলা, ইংরেজি, গণিত, বিজ্ঞান, ইসলাম, বাংলাদেশ, **ICT**, স্বাস্থ্য

## 4. Verify student path (Class 6 গণিত)
1. Academic → **ষষ্ঠ শ্রেণি** → **গণিত**
2. Open **পূর্ণসংখ্যা / Integers**
3. Expect rich NCTB body (সংখ্যারেখা, উদাহরণ, কুইজ)

## 5. Optional: refresh thin bodies
`POST /api/admin/curriculum/backfill-contents` with `{ "force": true }`

## 6. Health
https://ononno-two.vercel.app/api/health → `"status":"ok"`

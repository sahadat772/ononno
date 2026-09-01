# PHASE 2 — Student Learning Experience & Study Planner

## Goal
Published Curriculum → personal study journey (time, progress, weak areas, plan).

## Hard rules (locked)
1. **No curriculum pipeline change** — planner never extracts PDF or calls Gemini for new curriculum.
2. Student selects only **published + approved** lessons.
3. **Minimum session time: 5 minutes** (not 25). Student may choose 5 / 10 / 15 / 25 / 30 / 45 / 60 / custom (≥5).
4. Sequential unlock still applies inside chapter when opening lessons.

## Opinion / design choices
- Prefer **heuristic session builder** (lesson `duration_minutes` + fixed quiz/summary blocks) over AI scheduling in Phase 2a.
- Reuse `/dashboard/student/learning-path` as entry (already linked as “আজকের Plan”) instead of a third parallel page.
- Weakness from existing `learning_progress.score` (Strong ≥80, Medium 50–79, Weak <50).
- Track **planned_minutes** vs **actual_seconds** separately.
- Admin analytics is Phase 2d after student sessions work.

## Data model
- `study_sessions` — student, scope, planned/actual time, status
- `study_session_items` — ordered lesson/review/quiz/summary blocks

## Session builder (heuristic)
| Planned | Content |
|---------|---------|
| 5–14 min | 1 short lesson slice or 1 lesson + tiny quiz |
| 15–29 | 1 lesson + quiz |
| 30–44 | 1 lesson + review + quiz + summary |
| 45–59 | 1–2 lessons + quiz |
| 60+ | 2 lessons + quiz + revision |

Only lessons with `is_published = true` and unlock-eligible.

## Implementation slices
- **2a** Schema + API create session + time picker UI
- **2b** Active session runner + heartbeat time tracking
- **2c** Weak lesson card on dashboard + streak/weekly widgets
- **2d** Admin learning analytics

## Out of scope this phase
Google Drive, curriculum extract/generate, Kids Zone full merge.

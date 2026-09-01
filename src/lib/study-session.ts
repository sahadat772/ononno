/**
 * Phase 2 — Study session planner helpers.
 * NEVER calls Gemini / PDF extract. Only schedules published lessons.
 */

export const MIN_STUDY_MINUTES = 5;
export const MAX_STUDY_MINUTES = 240;

export const STUDY_TIME_PRESETS = [5, 10, 15, 25, 30, 45, 60] as const;

export type SessionItemType = "lesson" | "review" | "quiz" | "summary";

export type PublishedLessonLite = {
  id: string;
  title: string;
  title_bn?: string | null;
  duration_minutes?: number | null;
  chapter_id: string;
  subject_id: string;
  class_id: string;
  order_index?: number | null;
  lesson_number?: number | null;
};

export type PlannedItem = {
  lesson_id: string;
  title: string;
  title_bn?: string | null;
  item_type: SessionItemType;
  planned_minutes: number;
  position: number;
};

export function clampStudyMinutes(raw: number): number {
  if (!Number.isFinite(raw)) return MIN_STUDY_MINUTES;
  return Math.min(MAX_STUDY_MINUTES, Math.max(MIN_STUDY_MINUTES, Math.round(raw)));
}

/**
 * Build a session plan from published lessons and available minutes.
 * Prefer sequential lessons starting from the first incomplete if provided.
 */
export function buildSessionPlan(opts: {
  plannedMinutes: number;
  lessons: PublishedLessonLite[];
}): PlannedItem[] {
  const budget = clampStudyMinutes(opts.plannedMinutes);
  const lessons = [...opts.lessons].sort(
    (a, b) =>
      (a.order_index ?? 0) - (b.order_index ?? 0) ||
      (a.lesson_number ?? 0) - (b.lesson_number ?? 0),
  );

  if (lessons.length === 0) return [];

  const items: PlannedItem[] = [];
  let used = 0;
  let position = 0;

  const quizMin = budget <= 14 ? 2 : budget <= 29 ? 5 : 7;
  const summaryMin = budget >= 30 ? 3 : 0;
  const reviewMin = budget >= 30 ? 5 : 0;

  // Reserve quiz/summary/review from budget for first lesson path
  let lessonBudget = Math.max(5, budget - quizMin - summaryMin - reviewMin);

  for (const les of lessons) {
    const dur = Math.max(5, Math.min(les.duration_minutes ?? 15, 40));
    if (used + Math.min(dur, lessonBudget) > budget && items.some((i) => i.item_type === "lesson")) {
      break;
    }
    if (used >= budget) break;

    const slice = Math.min(dur, budget - used, lessonBudget);
    if (slice < 5 && items.length > 0) break;

    items.push({
      lesson_id: les.id,
      title: les.title,
      title_bn: les.title_bn,
      item_type: "lesson",
      planned_minutes: Math.max(5, slice),
      position: position++,
    });
    used += Math.max(5, slice);
    lessonBudget -= slice;

    // One lesson for short sessions; up to 2 for 45+
    if (budget < 45) break;
    if (items.filter((i) => i.item_type === "lesson").length >= 2) break;
  }

  if (items.length === 0 && lessons[0]) {
    items.push({
      lesson_id: lessons[0].id,
      title: lessons[0].title,
      title_bn: lessons[0].title_bn,
      item_type: "lesson",
      planned_minutes: Math.min(budget, 15),
      position: position++,
    });
    used = items[0].planned_minutes;
  }

  const primary = items.find((i) => i.item_type === "lesson");
  if (!primary) return items;

  if (reviewMin > 0 && used + reviewMin <= budget) {
    items.push({
      lesson_id: primary.lesson_id,
      title: primary.title,
      title_bn: primary.title_bn,
      item_type: "review",
      planned_minutes: reviewMin,
      position: position++,
    });
    used += reviewMin;
  }

  if (used + quizMin <= budget + 2) {
    items.push({
      lesson_id: primary.lesson_id,
      title: primary.title,
      title_bn: primary.title_bn,
      item_type: "quiz",
      planned_minutes: quizMin,
      position: position++,
    });
    used += quizMin;
  }

  if (summaryMin > 0 && used + summaryMin <= budget + 2) {
    items.push({
      lesson_id: primary.lesson_id,
      title: primary.title,
      title_bn: primary.title_bn,
      item_type: "summary",
      planned_minutes: summaryMin,
      position: position++,
    });
  }

  return items;
}
